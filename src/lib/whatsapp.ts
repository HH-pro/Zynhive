// ─── src/lib/whatsapp.ts ──────────────────────────────────────────────────────
// Sends a WhatsApp message via CallMeBot (free, no backend needed).
// Each recipient must activate CallMeBot once by sending:
//   "I allow callmebot to send me messages"
// to +34 644 59 78 74 on WhatsApp — they'll receive their API key back.

export async function sendWhatsApp(
  phone: string,
  apiKey: string,
  message: string,
): Promise<void> {
  if (!phone?.trim() || !apiKey?.trim()) return;
  const url =
    `https://api.callmebot.com/whatsapp.php` +
    `?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(message)}` +
    `&apikey=${encodeURIComponent(apiKey)}`;
  try {
    await fetch(url, { mode: "no-cors" });
  } catch {
    console.warn("[WhatsApp] notification request failed");
  }
}

export async function sendWhatsAppToAll(
  members: Array<{ number: string; apiKey: string }>,
  message: string,
): Promise<void> {
  await Promise.allSettled(
    members
      .filter((m) => m.number?.trim() && m.apiKey?.trim())
      .map((m) => sendWhatsApp(m.number, m.apiKey, message)),
  );
}
