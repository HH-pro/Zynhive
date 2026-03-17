// ─── src/lib/lead-ai.ts ──────────────────────────────────────────────────────
import type { FirestoreLead, AuditResult, FollowUpKey } from "../types/leads";

// ══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════════════════

const OPENROUTER_KEY: string = import.meta.env.VITE_OPENROUTER_API_KEY ?? "";
const HASDATA_KEY: string = import.meta.env.VITE_HASDATA_API_KEY ?? "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const HASDATA_URL = "https://api.hasdata.com/v1/google-maps";

// openrouter/free = auto-picks best available free model — kabhi 404 nahi aata
const MODELS = [
  "openrouter/free",                              // auto-picks best available — PRIMARY
  "mistralai/mistral-small-3.1-24b-instruct:free", // confirmed working fallback
  "deepseek/deepseek-chat-v3-0324:free",           // confirmed working fallback
  "nvidia/llama-3.1-nemotron-nano-8b-v1:free",     // lightweight fallback
];

export const AI_ENABLED = Boolean(OPENROUTER_KEY);
export const HASDATA_ENABLED = Boolean(HASDATA_KEY);

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
      if (retries > 0) {
        const waitMs = (3 - retries) * 4000; // 4s, 8s
        console.warn(`[AI] 429 on ${model} → waiting ${waitMs / 1000}s (${retries} retries left)`);
        await new Promise((r) => setTimeout(r, waitMs));
        return callAI(messages, modelIndex, retries - 1);
      }
      if (modelIndex + 1 < MODELS.length) {
        console.warn(`[AI] ${model} exhausted → trying ${MODELS[modelIndex + 1]}`);
        await new Promise((r) => setTimeout(r, 1000));
        return callAI(messages, modelIndex + 1, 2);
      }
      throw new Error("Sab models rate limited hain — 1 minute baad try karo");
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
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
// HASDATA REAL GOOGLE MAPS LEAD SEARCH
// ══════════════════════════════════════════════════════════════════════════════

export interface HasDataLead {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviews: number;
  categories: string[];
  leadSource: string;
}

export async function searchRealLeadsHasData(
  keyword: string,
  location: string,
): Promise<HasDataLead[]> {
  if (!HASDATA_ENABLED) {
    console.warn("HASDATA_API_KEY missing - falling back to AI-generated sample data");
    return searchLeadsAIFallback(keyword, location);
  }

  try {
    // Parse location into city and country
    const locationParts = location.split(',').map(part => part.trim());
    const city = locationParts[0] || location;
    const country = locationParts[1] || "US";

    const response = await fetch(
      `${HASDATA_URL}/search?q=${encodeURIComponent(keyword + ' ' + city)}&lat=&lng=&radius=25&limit=20`,
      {
        headers: {
          'x-api-key': HASDATA_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HasData API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform HasData response to our format
    const leads: HasDataLead[] = (data.data || []).map((item: any) => ({
      companyName: item.name || item.title || "Unknown",
      email: item.email || item.website?.split('//')[1]?.split('/')[0] + '@info.com' || `contact@${item.domain || 'example'}.com`,
      phone: item.phone || item.telephone || "+1234567890",
      website: item.website || item.domain ? `https://${item.domain}` : "",
      address: item.address || item.full_address || "",
      city: item.city || city,
      country: item.country || country,
      rating: item.rating || 0,
      reviews: item.reviews || 0,
      categories: item.categories || [keyword],
      leadSource: "HasData Google Maps",
    }));

    return leads;

  } catch (error) {
    console.error("HasData API error:", error);
    console.log("Falling back to AI-generated sample data");
    return searchLeadsAIFallback(keyword, location);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AI LEAD SEARCH FALLBACK (Sample Data)
// ══════════════════════════════════════════════════════════════════════════════

export interface AISearchResult {
  companyName: string;
  email:       string;
  phone:       string;
  website:     string;
  country:     string;
  city:        string;
  leadSource:  string;
  rating?:     number;
  reviews?:    number;
  categories?: string[];
}

async function searchLeadsAIFallback(
  keyword: string,
  location: string,
): Promise<AISearchResult[]> {
  try {
    const raw = await callAI([
      {
        role: "system",
        content: "You are a lead generation assistant. Generate realistic business lead data. Return ONLY a valid JSON array.",
      },
      {
        role: "user",
        content: `Generate 8 realistic business leads for:
Industry/Keyword: ${keyword}
Location: ${location}

Return JSON array only with realistic data:
[{
  "companyName": "Realistic Business Name",
  "email": "contact@realdomain.com",
  "phone": "+1-234-567-8900",
  "website": "https://realbusiness.com",
  "country": "${location.split(",").pop()?.trim() || location}",
  "city": "${location.split(",")[0]?.trim() || location}",
  "rating": 4.5,
  "reviews": 127,
  "categories": ["${keyword}", "Business Services"],
  "leadSource": "AI Generated (Sample)"
}]`,
      },
    ]);

    return parseAIJSON<AISearchResult[]>(raw);
  } catch (error) {
    console.error("AI fallback error:", error);
    // Return hardcoded sample data if AI fails
    return generateSampleLeads(keyword, location);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// HARDCODED SAMPLE LEADS (Ultimate Fallback)
// ══════════════════════════════════════════════════════════════════════════════

function generateSampleLeads(keyword: string, location: string): AISearchResult[] {
  const city = location.split(",")[0]?.trim() || location;
  const country = location.split(",").pop()?.trim() || "US";
  
  const businesses = [
    `${keyword} Solutions Inc.`,
    `${keyword} Pros LLC`,
    `Advanced ${keyword}`,
    `${keyword} Experts Group`,
    `Premier ${keyword} Services`,
    `${keyword} Masters`,
    `Elite ${keyword} Co.`,
    `${keyword} Specialists`,
  ];

  return businesses.map((name, index) => ({
    companyName: name,
    email: `info@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    phone: `+1-${Math.floor(200 + index * 100)}-555-${String(1000 + index).slice(1)}`,
    website: `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    country,
    city,
    rating: 3.5 + Math.random() * 1.5,
    reviews: Math.floor(20 + Math.random() * 200),
    categories: [keyword, "Business Services"],
    leadSource: "Sample Data (Hardcoded)",
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LEAD SEARCH FUNCTION (Auto-detects real vs sample)
// ══════════════════════════════════════════════════════════════════════════════

export async function searchLeads(
  keyword: string,
  location: string,
  useRealData: boolean = true
): Promise<AISearchResult[]> {
  if (useRealData && HASDATA_ENABLED) {
    try {
      const realLeads = await searchRealLeadsHasData(keyword, location);
      return realLeads;
    } catch (error) {
      console.error("Real data fetch failed, using AI sample:", error);
      return searchLeadsAIFallback(keyword, location);
    }
  } else {
    return searchLeadsAIFallback(keyword, location);
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

  const prevCtx = previousEmails.length > 0
    ? `\n\nPrevious emails (do not repeat, build on these):\n${previousEmails
        .map((e, i) => `--- #${i + 1} ---\n${e}`).join("\n\n")}`
    : "";

  // Add rating/reviews to context if available from HasData
  const ratingContext = lead.rating ? `\nGoogle Rating: ${lead.rating}★ (${lead.reviews} reviews)` : "";

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
        "Context: " + (audit?.summary || lead.proposal || "N/A") + ratingContext + prevCtx + "\n\n" +
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
    if (i < leads.length - 1) await new Promise((r) => setTimeout(r, 3000));
  }

  return results;
}

// ══════════════════════════════════════════════════════════════════════════════
// API STATUS CHECK
// ══════════════════════════════════════════════════════════════════════════════

export async function checkApiStatus(): Promise<{ 
  ok: boolean; 
  message: string;
  hasData?: { ok: boolean; message: string };
}> {
  const status: any = { ok: true, message: "" };
  
  try {
    await callAI([{ role: "user", content: 'Reply only: {"ok":true}' }]);
    status.message = `OpenRouter ✓ (${MODELS[0]})`;
  } catch (err: any) {
    status.ok = false;
    status.message = err?.message ?? "OpenRouter connection failed";
  }

  // Check HasData status
  if (HASDATA_ENABLED) {
    try {
      const response = await fetch(`${HASDATA_URL}/account`, {
        headers: { 'x-api-key': HASDATA_KEY }
      });
      status.hasData = {
        ok: response.ok,
        message: response.ok ? "HasData ✓" : `HasData ${response.status}`
      };
    } catch (err: any) {
      status.hasData = {
        ok: false,
        message: "HasData connection failed"
      };
    }
  } else {
    status.hasData = {
      ok: false,
      message: "HasData API key missing - using AI sample data"
    };
  }

  return status;
}