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
  "openrouter/free",                              // auto-picks best available — PRIMARY
  "mistralai/mistral-small-3.1-24b-instruct:free", // confirmed working fallback
  "deepseek/deepseek-chat-v3-0324:free",           // confirmed working fallback
  "nvidia/llama-3.1-nemotron-nano-8b-v1:free",     // lightweight fallback
];

export const AI_ENABLED = Boolean(OPENROUTER_KEY);

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
        max_tokens:  1024,
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

// ── JSON parser ───────────────────────────────────────────────────────────────
function parseAIJSON<T>(raw: string): T {
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const obj   = s.indexOf("{");
  const arr   = s.indexOf("[");
  const start = arr >= 0 && (arr < obj || obj < 0) ? arr : obj;
  if (start > 0) s = s.slice(start);
  const isArr = s.startsWith("[");
  const end   = s.lastIndexOf(isArr ? "]" : "}");
  if (end >= 0) s = s.slice(0, end + 1);
  return JSON.parse(s);
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

  const prevCtx = previousEmails.length > 0
    ? `\n\nPrevious emails (do not repeat, build on these):\n${previousEmails
        .map((e, i) => `--- #${i + 1} ---\n${e}`).join("\n\n")}`
    : "";

  const raw = await callAI([
    {
      role: "system",
      content: `Expert B2B cold email copywriter. Write short, personalised, conversational emails.

Rules:
- Body max 120 words
- No filler phrases
- Reference specific website issues
- One clear low-commitment CTA
- Professional but human — not salesy
- Plain text only, no HTML
- Return ONLY valid JSON: {"subject":"...","body":"..."}`,
    },
    {
      role: "user",
      content: "Write " + (isInitial ? "a cold outreach email" : `follow-up #${followUpNum}`) + ":\n\n" +
        "Company: " + lead.companyName + "\n" +
        "Website: " + (lead.website || "N/A") + "\n" +
        "Email: " + lead.email + "\n" +
        "Country: " + (lead.country || "N/A") + "\n" +
        "Issues: " + (issues.length ? issues.join(", ") : "general digital improvement needed") + "\n" +
        "Context: " + (audit?.summary || lead.proposal || "N/A") + prevCtx + "\n\n" +
        (!isInitial ? "Reference previous emails. Be shorter, add mild urgency.\n" : "") +
        (isFinal ? "Final follow-up. Be graceful, leave door open, no pressure.\n" : "") + "\n" +
        'Return ONLY JSON: {"subject":"...","body":"..."}'
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
        subject: `Quick question for ${lead.companyName}`,
        body:    `Hi ${lead.companyName} Team,\n\nI wanted to reach out about improving your online presence. Would you be open to a quick chat?\n\nBest regards`,
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
Industry: ${keyword}
Location: ${location}

Return JSON array only:
[{
  "companyName": "...",
  "email": "contact@example.com",
  "phone": "+1234567890",
  "website": "https://example.com",
  "country": "${location.split(",").pop()?.trim() || location}",
  "city": "${location.split(",")[0]?.trim() || location}",
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