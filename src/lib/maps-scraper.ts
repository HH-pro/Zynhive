// ─── src/lib/maps-scraper.ts ──────────────────────────────────────────────────
// Production Google Maps Lead Scraper
// Uses real APIs to extract actual business data
//
// FREE APIs used (priority order):
//   1. HasData API     — 1,000 free calls/month — hasdata.com (no credit card)
//   2. Outscraper API  — 200 free calls/month   — outscraper.com
//   3. OpenRouter AI   — fallback (generates sample data if APIs unavailable)
//
// Setup .env:
//   VITE_HASDATA_API_KEY=your_key     ← hasdata.com/dashboard
//   VITE_OUTSCRAPER_API_KEY=your_key  ← app.outscraper.com/profile

const HASDATA_KEY    = import.meta.env.VITE_HASDATA_API_KEY    ?? "";
const OUTSCRAPER_KEY = import.meta.env.VITE_OUTSCRAPER_API_KEY ?? "";
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY ?? "";

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

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 1: HasData API (Best — structured JSON, fast)
// Get free key: https://hasdata.com (1000 free calls/month)
// ══════════════════════════════════════════════════════════════════════════════

async function scrapeViaHasData(
  keyword: string,
  location: string,
  limit = 20,
): Promise<ScrapedLead[]> {
  if (!HASDATA_KEY) throw new Error("HasData API key missing");

  const query    = encodeURIComponent(`${keyword} in ${location}`);
  const url      = `https://api.hasdata.com/scrape/google-maps/search?query=${query}&limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      "x-api-key":    HASDATA_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HasData ${res.status}: ${err}`);
  }

  const data = await res.json();
  const places = data.localResults ?? data.results ?? [];

  return places.map((p: any): ScrapedLead => ({
    companyName: p.title        ?? p.name        ?? "",
    email:       p.email        ?? extractEmail(p.website) ?? "",
    phone:       p.phoneNumber  ?? p.phone        ?? "",
    website:     cleanUrl(p.website ?? ""),
    address:     p.address      ?? p.fullAddress  ?? "",
    country:     extractCountry(p.address ?? "", location),
    city:        extractCity(p.address ?? "", location),
    rating:      p.rating       ?? 0,
    reviews:     p.reviewsCount ?? p.reviews      ?? 0,
    category:    p.type         ?? p.category     ?? keyword,
    leadSource:  "Google Maps",
    mapsUrl:     p.placeUrl     ?? p.url          ?? "",
    instagram:   p.instagram    ?? "",
    facebook:    p.facebook     ?? "",
  })).filter((l: ScrapedLead) => l.companyName);
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 2: Outscraper API (Good — email extraction included)
// Get free key: https://app.outscraper.com/profile (200 free/month)
// ══════════════════════════════════════════════════════════════════════════════

async function scrapeViaOutscraper(
  keyword: string,
  location: string,
  limit = 20,
): Promise<ScrapedLead[]> {
  if (!OUTSCRAPER_KEY) throw new Error("Outscraper API key missing");

  const query = `${keyword} ${location}`;
  const url   = `https://api.app.outscraper.com/maps/search-v3?query=${encodeURIComponent(query)}&limit=${limit}&async=false`;

  const res = await fetch(url, {
    headers: {
      "X-API-KEY":    OUTSCRAPER_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`Outscraper ${res.status}`);

  const data   = await res.json();
  const places = data.data?.[0] ?? [];

  return places.map((p: any): ScrapedLead => ({
    companyName: p.name             ?? "",
    email:       p.email            ?? p.emails_and_contacts?.[0]?.value ?? "",
    phone:       p.phone            ?? p.international_phone ?? "",
    website:     cleanUrl(p.site    ?? p.website ?? ""),
    address:     p.full_address     ?? p.address ?? "",
    country:     p.country          ?? extractCountry(p.full_address ?? "", location),
    city:        p.city             ?? extractCity(p.full_address ?? "", location),
    rating:      p.rating           ?? 0,
    reviews:     p.reviews          ?? p.reviews_count ?? 0,
    category:    p.type             ?? keyword,
    leadSource:  "Google Maps",
    mapsUrl:     p.place_link       ?? p.google_maps_url ?? "",
    instagram:   p.instagram        ?? "",
    facebook:    p.facebook         ?? "",
  })).filter((l: ScrapedLead) => l.companyName);
}

// ══════════════════════════════════════════════════════════════════════════════
// METHOD 3: OpenRouter AI Fallback (sample data when APIs not available)
// ══════════════════════════════════════════════════════════════════════════════

async function scrapeViaAI(
  keyword: string,
  location: string,
  limit = 10,
): Promise<ScrapedLead[]> {
  if (!OPENROUTER_KEY) throw new Error("No API keys available");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
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
      messages: [{
        role:    "system",
        content: "Generate realistic business data. Return ONLY valid JSON array, no explanation.",
      }, {
        role:    "user",
        content: `Generate ${limit} realistic ${keyword} business leads in ${location}.

Return JSON array:
[{
  "companyName": "Real-sounding business name",
  "email": "contact@domain.com",
  "phone": "+country_code_number",
  "website": "https://domain.com",
  "address": "Street, City, Country",
  "country": "${location.split(",").pop()?.trim() || location}",
  "city": "${location.split(",")[0]?.trim() || location}",
  "rating": 4.2,
  "reviews": 87,
  "category": "${keyword}",
  "leadSource": "Google Maps",
  "mapsUrl": "",
  "instagram": "",
  "facebook": ""
}]`,
      }],
    }),
  });

  if (!res.ok) throw new Error(`AI fallback failed: ${res.status}`);
  const data    = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  // Parse JSON
  let s = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const arrStart = s.indexOf("[");
  if (arrStart > 0) s = s.slice(arrStart);
  const arrEnd = s.lastIndexOf("]");
  if (arrEnd >= 0) s = s.slice(0, arrEnd + 1);

  return JSON.parse(s);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — tries each method in order
// ══════════════════════════════════════════════════════════════════════════════

export interface ScrapeOptions {
  keyword:  string;
  location: string;
  limit?:   number;
}

export interface ScrapeResult {
  leads:    ScrapedLead[];
  source:   "hasdata" | "outscraper" | "ai-sample";
  total:    number;
  error?:   string;
}

export async function scrapeGoogleMaps(
  opts: ScrapeOptions,
): Promise<ScrapeResult> {
  const { keyword, location, limit = 20 } = opts;

  // Method 1 — HasData (real data)
  if (HASDATA_KEY) {
    try {
      console.log("[Scraper] Trying HasData API…");
      const leads = await scrapeViaHasData(keyword, location, limit);
      console.log(`[Scraper] HasData: ${leads.length} results`);
      return { leads, source: "hasdata", total: leads.length };
    } catch (err) {
      console.warn("[Scraper] HasData failed:", err);
    }
  }

  // Method 2 — Outscraper (real data)
  if (OUTSCRAPER_KEY) {
    try {
      console.log("[Scraper] Trying Outscraper API…");
      const leads = await scrapeViaOutscraper(keyword, location, limit);
      console.log(`[Scraper] Outscraper: ${leads.length} results`);
      return { leads, source: "outscraper", total: leads.length };
    } catch (err) {
      console.warn("[Scraper] Outscraper failed:", err);
    }
  }

  // Method 3 — AI sample (fallback)
  console.log("[Scraper] Using AI sample data (no real API keys set)");
  const leads = await scrapeViaAI(keyword, location, Math.min(limit, 10));
  return {
    leads,
    source: "ai-sample",
    total:  leads.length,
    error:  "Using AI-generated sample data. Add VITE_HASDATA_API_KEY for real Google Maps data.",
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function cleanUrl(url: string): string {
  if (!url) return "";
  if (!url.startsWith("http")) url = "https://" + url;
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

function extractEmail(website: string): string {
  // Email usually not on Maps — return empty, user can audit later
  return "";
}

function extractCity(address: string, fallback: string): string {
  if (!address) return fallback.split(",")[0]?.trim() ?? fallback;
  const parts = address.split(",");
  return parts.length >= 2 ? parts[parts.length - 2]?.trim() : fallback;
}

function extractCountry(address: string, fallback: string): string {
  if (!address) return fallback.split(",").pop()?.trim() ?? fallback;
  const parts = address.split(",");
  return parts[parts.length - 1]?.trim() ?? fallback.split(",").pop()?.trim() ?? fallback;
}