// ─── src/lib/lead-ai.ts ──────────────────────────────────────────────────────
import type { FirestoreLead, AuditResult, FollowUpKey } from "../types/leads";

// ══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════════════

const OPENROUTER_KEY: string = import.meta.env.VITE_OPENROUTER_API_KEY ?? "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// openrouter/free = auto-picks best available free model — kabhi 404 nahi aata
// ✅ FINAL FIX — yeh kabhi 404 nahi dega
const MODELS = [
  "openrouter/free",                               // auto-picks best available — PRIMARY
  "mistralai/mistral-small-3.1-24b-instruct:free", // confirmed working fallback
  "deepseek/deepseek-chat-v3-0324:free",           // confirmed working fallback
  "nvidia/llama-3.1-nemotron-nano-8b-v1:free",     // lightweight fallback
];

export const AI_ENABLED = Boolean(OPENROUTER_KEY);

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/** Strip newlines / carriage returns so they can't break a JSON string value */
function sanitize(val: string | null | undefined, maxLen = 300): string {
  if (!val) return "N/A";
  return val.replace(/[\r\n\t]+/g, " ").replace(/"/g, "'").trim().slice(0, maxLen);
}

// ══════════════════════════════════════════════════════════════════════════════
// CORE CALLER — auto retry + model rotation on 429
// ══════════════════════════════════════════════════════════════════════════════

async function callAI(
  messages: { role: string; content: string }[],
  modelIndex = 0,
  retries = 2,
): Promise<string> {
  if (!OPENROUTER_KEY) {
    throw new Error(
      "OpenRouter API key missing! Add VITE_OPENROUTER_API_KEY to .env\n" +
      "Get free key: https://openrouter.ai/keys",
    );
  }

  const model = MODELS[modelIndex] ?? MODELS[0];

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer":  typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
        "X-Title":       "ZynHive CRM",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens:  1200,   // bumped from 1024 — prevents mid-string truncation
        temperature: 0.7,
      }),
    });

    // 429 Rate Limited
    if (res.status === 429) {
      // Pehle retry karo same model pe — thodi wait ke saath
      if (retries > 0) {
        const waitMs = (3 - retries) * 4000; // 4s, 8s
        console.warn(`[AI] 429 on ${model} → waiting ${waitMs / 1000}s (${retries} retries left)`);
        await new Promise((r) => setTimeout(r, waitMs));
        return callAI(messages, modelIndex, retries - 1);
      }
      // Retries khatam → next model try karo
      if (modelIndex + 1 < MODELS.length) {
        console.warn(`[AI] ${model} exhausted → trying ${MODELS[modelIndex + 1]}`);
        await new Promise((r) => setTimeout(r, 1000));
        return callAI(messages, modelIndex + 1, 2);
      }
      throw new Error("Sab models rate limited hain — 1 minute baad try karo");
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // 404 = model unavailable → next model
      if (res.status === 404 && modelIndex + 1 < MODELS.length) {
        console.warn(`[AI] ${model} not found → trying ${MODELS[modelIndex + 1]}`);
        return callAI(messages, modelIndex + 1, 2);
      }
      throw new Error(`OpenRouter ${res.status}: ${body}`);
    }

    const data    = await res.json();
    const content = (data.choices?.[0]?.message?.content as string) ?? "";
    if (!content) throw new Error("Empty AI response");
    return content;

  } catch (err: any) {
    // Network error → next model
    if (modelIndex + 1 < MODELS.length && !err?.message?.includes("rate limited")) {
      console.warn(`[AI] ${model} failed → trying ${MODELS[modelIndex + 1]}`);
      return callAI(messages, modelIndex + 1, 2);
    }
    throw err;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// JSON PARSER — hardened against truncation & unterminated strings
// ══════════════════════════════════════════════════════════════════════════════

function parseAIJSON<T>(raw: string): T {
  // Strip markdown code fences
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Find the outermost JSON object or array
  const objIdx = s.indexOf("{");
  const arrIdx = s.indexOf("[");
  const start  = arrIdx >= 0 && (arrIdx < objIdx || objIdx < 0) ? arrIdx : objIdx;
  if (start > 0) s = s.slice(start);

  const isArr = s.startsWith("[");
  const end   = s.lastIndexOf(isArr ? "]" : "}");
  if (end >= 0) s = s.slice(0, end + 1);

  // First attempt — clean parse
  try {
    return JSON.parse(s);
  } catch {
    // ── Repair truncated / unterminated JSON ─────────────────────────────────
    // 1. Remove trailing comma before closing brace/bracket
    s = s.replace(/,\s*([\]}])/g, "$1");

    // 2. If the last character is not a closing brace/bracket, the response was
    //    cut off mid-string. Close the open string and the object.
    const last = s[s.length - 1];
    if (last !== "}" && last !== "]") {
      // Count unclosed quotes to decide if we're inside a string
      const quoteCount = (s.match(/(?<!\\)"/g) ?? []).length;
      if (quoteCount % 2 !== 0) {
        // Odd number of quotes → we're inside an unterminated string
        s += '"';
      }
      // Close any open nested objects first, then the root
      const openBraces   = (s.match(/{/g) ?? []).length - (s.match(/}/g) ?? []).length;
      const openBrackets = (s.match(/\[/g) ?? []).length - (s.match(/\]/g) ?? []).length;
      s += "]".repeat(Math.max(0, openBrackets));
      s += "}".repeat(Math.max(0, openBraces));
    }

    return JSON.parse(s);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// WEBSITE AUDIT
// ══════════════════════════════════════════════════════════════════════════════

export async function auditWebsite(url: string): Promise<AuditResult> {
  const domain = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];

  const raw = await callAI([
    {
      role: "system",
      content: `You are a digital marketing analyst. From the URL/domain, infer the business type and audit it for common digital issues.

Return ONLY valid JSON (no explanation, no markdown):
{
  "hasChatbot": false,
  "hasQuickResponse": false,
  "hasLeadForm": false,
  "hasMobileOptimized": true,
  "summary": "2-3 sentence business description and key weaknesses",
  "missingFeatures": ["feature1", "feature2"],
  "score": 45
}

Scoring (be realistic — most small businesses score 25-60):
- hasChatbot: true only for large SaaS/enterprise
- hasQuickResponse: true only for major brands with 24/7 support
- hasLeadForm: true for agencies, consultancies, SaaS, service businesses
- hasMobileOptimized: true for most sites built after 2018
- score: 0-100 digital maturity estimate`,
    },
    {
      role: "user",
      content: `Audit website: ${url}\nDomain: ${domain}\n\nReturn ONLY the JSON.`,
    },
  ]);

  return parseAIJSON<AuditResult>(raw);
}

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL GENERATION
// ══════════════════════════════════════════════════════════════════════════════

export async function generateEmail(
  lead: FirestoreLead,
  emailType: FollowUpKey | string,
  previousEmails: string[] = [],
): Promise<{ subject: string; body: string }> {
  const audit  = lead.auditData;
  const issues: string[] = [];

  if (audit) {
    if (!audit.hasChatbot)         issues.push("no live chat or chatbot");
    if (!audit.hasQuickResponse)   issues.push("slow or no quick response");
    if (!audit.hasLeadForm)        issues.push("no lead capture form");
    if (!audit.hasMobileOptimized) issues.push("not mobile optimised");
  }

  const isInitial   = emailType === "initial";
  const followUpNum = isInitial ? 1 : parseInt((emailType as string).split("-")[1]) + 1;
  const isFinal     = emailType === "followup-5";

  // ── Safe previous-email context (sanitized, capped per entry) ────────────
  const prevCtx = previousEmails.length > 0
    ? "\n\nPrevious emails (do not repeat, build on these):\n" +
      previousEmails
        .map((e, i) => `--- #${i + 1} ---\n${sanitize(e, 400)}`)
        .join("\n\n")
    : "";

  // ── Build prompt lines safely — no raw multi-line values in the string ───
  const promptLines = [
    `Write ${isInitial ? "a cold outreach email" : `follow-up #${followUpNum}`}:`,
    "",
    `Company: ${sanitize(lead.companyName)}`,
    `Website: ${sanitize(lead.website)}`,
    `Email: ${sanitize(lead.email)}`,
    `Country: ${sanitize(lead.country)}`,
    `Issues: ${issues.length ? issues.join(", ") : "general digital improvement needed"}`,
    `Context: ${sanitize(audit?.summary || lead.proposal)}`,
    prevCtx,
    "",
    !isInitial ? "Reference previous emails. Be shorter, add mild urgency." : "",
    isFinal    ? "Final follow-up. Be graceful, leave door open, no pressure." : "",
    "",
    'Return ONLY valid JSON: {"subject":"...","body":"..."}',
  ].filter((line) => line !== "");

  const raw = await callAI([
    {
      role: "system",
      content: `Expert B2B cold email copywriter. Write short, personalised, conversational emails.

Rules:
- Body max 120 words
- No filler phrases
- Reference specific website issues if available
- One clear low-commitment CTA
- Professional but human — not salesy
- Plain text only, no HTML
- Return ONLY valid JSON: {"subject":"...","body":"..."}`,
    },
    {
      role: "user",
      content: promptLines.join("\n"),
    },
  ]);

  return parseAIJSON<{ subject: string; body: string }>(raw);
}

// ══════════════════════════════════════════════════════════════════════════════
// BATCH EMAIL GENERATION
// ══════════════════════════════════════════════════════════════════════════════

export async function generateBatchEmails(
  leads: FirestoreLead[],
  emailType: FollowUpKey | string,
): Promise<Map<string, { subject: string; body: string }>> {
  const results = new Map<string, { subject: string; body: string }>();

  // Sequential (not parallel) — avoids rate limit
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    try {
      const prev = (lead.mailHistory ?? [])
        .filter((m) => m.bodySnapshot)
        .map((m) => m.bodySnapshot!);
      const email = await generateEmail(lead, emailType, prev);
      results.set(lead.id!, email);
    } catch (err) {
      console.error(`[AI] Email failed for ${lead.companyName}:`, err);
      results.set(lead.id!, {
        subject: `Quick question for ${sanitize(lead.companyName, 60)}`,
        body:    `Hi ${sanitize(lead.companyName, 60)} Team,\n\nI wanted to reach out about improving your online presence. Would you be open to a quick chat?\n\nBest regards`,
      });
    }
    // 3s gap between each — stays well within rate limits
    if (i < leads.length - 1) await new Promise((r) => setTimeout(r, 3000));
  }

  return results;
}

// ══════════════════════════════════════════════════════════════════════════════
// AI LEAD SEARCH
// ══════════════════════════════════════════════════════════════════════════════

export interface AISearchResult {
  companyName: string;
  email:       string;
  phone:       string;
  website:     string;
  country:     string;
  city:        string;
  leadSource:  string;
}

export async function searchLeadsAI(
  keyword: string,
  location: string,
): Promise<AISearchResult[]> {
  const raw = await callAI([
    {
      role: "system",
      content: "Generate realistic sample business lead data for a CRM demo. Return ONLY a valid JSON array, no explanation.",
    },
    {
      role: "user",
      content: `Generate 6 realistic business leads:
Industry: ${sanitize(keyword, 100)}
Location: ${sanitize(location, 100)}

Return JSON array only:
[{
  "companyName": "...",
  "email": "contact@example.com",
  "phone": "+1234567890",
  "website": "https://example.com",
  "country": "${sanitize(location.split(",").pop()?.trim() || location, 60)}",
  "city": "${sanitize(location.split(",")[0]?.trim() || location, 60)}",
  "leadSource": "AI Search"
}]`,
    },
  ]);

  return parseAIJSON<AISearchResult[]>(raw);
}

// ══════════════════════════════════════════════════════════════════════════════
// API STATUS CHECK
// ══════════════════════════════════════════════════════════════════════════════

export async function checkApiStatus(): Promise<{ ok: boolean; message: string }> {
  try {
    await callAI([{ role: "user", content: 'Reply only: {"ok":true}' }]);
    return { ok: true, message: `Connected ✓ (${MODELS[0]})` };
  } catch (err: any) {
    return { ok: false, message: err?.message ?? "Connection failed" };
  }
}