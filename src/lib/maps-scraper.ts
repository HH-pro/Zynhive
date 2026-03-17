// ─── src/lib/maps-scraper.ts ──────────────────────────────────────────────────
// Google Maps Lead Scraper — HasData API only
//
// Setup .env:
//   VITE_HASDATA_API_KEY=your_key   ← app.hasdata.com (free 1,000 credits/month)
//
// Endpoint : GET https://api.hasdata.com/scrape/google-maps/search
// Params   : q (required), ll (optional GPS), gl, hl, start
// Auth     : x-api-key header
// Cost     : 5 credits per request

const HASDATA_KEY    = import.meta.env.VITE_HASDATA_API_KEY    ?? "";
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY ?? "";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface ScrapedLead {
  companyName: string;
  email:       string;
  phone:       string;
  website:     string;
  address:     string;
  country:     string;
  city:        string;
  rating:      number;
  reviews:     number;
  category:    string;
  leadSource:  string;
  mapsUrl:     string;
  instagram:   string;
  facebook:    string;
}

export interface ScrapeOptions {
  keyword:  string;
  location: string;
  limit?:   number;
}

export interface ScrapeResult {
  leads:   ScrapedLead[];
  source:  "hasdata" | "ai-sample";
  total:   number;
  error?:  string;
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 1 — HasData API (real Google Maps data)
// Docs: https://docs.hasdata.com/apis/google-maps/search
// ══════════════════════════════════════════════════════════════════════════════

async function scrapeViaHasData(
  keyword:  string,
  location: string,
  limit:    number,
): Promise<ScrapedLead[]> {
  if (!HASDATA_KEY) throw new Error("HasData API key missing");

  // HasData uses `q` (not `query`) — combining keyword + location gives best results
  const params = new URLSearchParams({
    q:  `${keyword} in ${location}`,
    hl: "en",
  });

  const url = `https://api.hasdata.com/scrape/google-maps/search?${params.toString()}`;

  console.log("[Scraper] HasData request:", url);

  const res = await fetch(url, {
    method:  "GET",
    headers: {
      "x-api-key":    HASDATA_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HasData ${res.status}: ${body}`);
  }

  const data = await res.json();

  // HasData returns results under `localResults`
  const places: any[] = data.localResults ?? data.results ?? [];

  if (!places.length) {
    throw new Error("HasData returned 0 results — try a different keyword or location");
  }

  return places
    .slice(0, limit)
    .map((p: any): ScrapedLead => ({
      companyName: p.title        ?? p.name           ?? "",
      email:       p.email        ?? "",
      phone:       p.phoneNumber  ?? p.phone           ?? "",
      website:     cleanUrl(p.website ?? ""),
      address:     p.address      ?? p.fullAddress     ?? "",
      country:     extractCountry(p.address ?? p.fullAddress ?? "", location),
      city:        extractCity(p.address    ?? p.fullAddress ?? "", location),
      rating:      Number(p.rating)       || 0,
      reviews:     Number(p.reviewsCount  ?? p.reviews) || 0,
      category:    p.type         ?? p.category        ?? keyword,
      leadSource:  "Google Maps",
      mapsUrl:     p.placeUrl     ?? p.url             ?? "",
      instagram:   p.instagram    ?? "",
      facebook:    p.facebook     ?? "",
    }))
    .filter((l) => l.companyName.trim() !== "");
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 2 — OpenRouter AI fallback (sample data only, no real scraping)
// Only runs when VITE_HASDATA_API_KEY is NOT set
// ══════════════════════════════════════════════════════════════════════════════

async function scrapeViaAI(
  keyword:  string,
  location: string,
  limit:    number,
): Promise<ScrapedLead[]> {
  if (!OPENROUTER_KEY) throw new Error("No API keys configured");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "HTTP-Referer":  window.location.origin,
      "X-Title":       "ZynHive CRM",
    },
    body: JSON.stringify({
      model:       "openrouter/auto",
      max_tokens:  2000,
      temperature: 0.3,
      messages: [
        {
          role:    "system",
          content: "Generate realistic business data for a CRM demo. Return ONLY a valid JSON array, no explanation, no markdown.",
        },
        {
          role:    "user",
          content: `Generate ${Math.min(limit, 10)} realistic ${keyword} business leads in ${location}.

Return a JSON array like this:
[{
  "companyName": "Example Business",
  "email": "contact@example.com",
  "phone": "+92-300-0000000",
  "website": "https://example.com",
  "address": "123 Street, City, Country",
  "country": "${location.split(",").pop()?.trim() ?? location}",
  "city": "${location.split(",")[0]?.trim() ?? location}",
  "rating": 4.2,
  "reviews": 87,
  "category": "${keyword}",
  "leadSource": "Google Maps",
  "mapsUrl": "",
  "instagram": "",
  "facebook": ""
}]`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`AI fallback failed: ${res.status}`);

  const data    = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  // Parse the JSON array out of the response
  let s = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = s.indexOf("[");
  if (start > 0) s = s.slice(start);
  const end = s.lastIndexOf("]");
  if (end >= 0) s = s.slice(0, end + 1);

  return JSON.parse(s) as ScrapedLead[];
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export async function scrapeGoogleMaps(opts: ScrapeOptions): Promise<ScrapeResult> {
  const { keyword, location, limit = 20 } = opts;

  // ── HasData (real data) ───────────────────────────────────────────────────
  if (HASDATA_KEY) {
    try {
      console.log("[Scraper] Using HasData API…");
      const leads = await scrapeViaHasData(keyword, location, limit);
      console.log(`[Scraper] HasData returned ${leads.length} results`);
      return { leads, source: "hasdata", total: leads.length };
    } catch (err) {
      console.error("[Scraper] HasData failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      // Surface the real error to the UI — don't silently fall through
      return {
        leads:  [],
        source: "hasdata",
        total:  0,
        error:  `HasData error: ${msg}`,
      };
    }
  }

  // ── AI sample fallback (no real key set) ─────────────────────────────────
  console.log("[Scraper] No HasData key — falling back to AI sample data");
  try {
    const leads = await scrapeViaAI(keyword, location, limit);
    return {
      leads,
      source: "ai-sample",
      total:  leads.length,
      error:  "Using AI-generated sample data. Add VITE_HASDATA_API_KEY for real Google Maps data.",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { leads: [], source: "ai-sample", total: 0, error: msg };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function cleanUrl(url: string): string {
  if (!url) return "";
  const withProtocol = url.startsWith("http") ? url : `https://${url}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return url;
  }
}

function extractCity(address: string, fallback: string): string {
  if (!address) return fallback.split(",")[0]?.trim() ?? fallback;
  const parts = address.split(",");
  // Second-to-last part is usually city
  return parts.length >= 2
    ? (parts[parts.length - 2]?.trim() ?? fallback)
    : fallback;
}

function extractCountry(address: string, fallback: string): string {
  if (!address) return fallback.split(",").pop()?.trim() ?? fallback;
  const parts = address.split(",");
  return parts[parts.length - 1]?.trim() ?? fallback.split(",").pop()?.trim() ?? fallback;
}