// ─── src/lib/whatsapp.ts ──────────────────────────────────────────────────────
// Sends WhatsApp messages via Green API (free — 500 msg/month).
// Setup: greenapi.com → create instance → scan QR with your WhatsApp number.
// Add to .env:
//   VITE_GREENAPI_ID=your_instance_id
//   VITE_GREENAPI_TOKEN=your_api_token

const INSTANCE_ID    = import.meta.env.VITE_GREENAPI_ID    ?? "";
const INSTANCE_TOKEN = import.meta.env.VITE_GREENAPI_TOKEN ?? "";

function formatChatId(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@c.us`;
}

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!phone?.trim()) {
    console.warn("[WhatsApp] No phone number provided");
    return;
  }
  if (!INSTANCE_ID || !INSTANCE_TOKEN) {
    console.warn("[WhatsApp] Missing VITE_GREENAPI_ID or VITE_GREENAPI_TOKEN in .env");
    return;
  }

  const chatId = formatChatId(phone);
  const url = `https://api.green-api.com/waInstance${INSTANCE_ID}/sendMessage/${INSTANCE_TOKEN}`;

  console.log("[WhatsApp] Sending to", chatId, "via instance", INSTANCE_ID);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message }),
    });
    if (res.ok) {
      console.log("[WhatsApp] Sent successfully");
    } else {
      const body = await res.text().catch(() => "");
      console.warn("[WhatsApp] Failed:", res.status, body);
    }
  } catch (err) {
    console.warn("[WhatsApp] Request error:", err);
  }
}

export async function sendWhatsAppToAll(
  members: Array<{ number: string; apiKey?: string }>,
  message: string,
): Promise<void> {
  await Promise.allSettled(
    members
      .filter((m) => m.number?.trim())
      .map((m) => sendWhatsApp(m.number, message)),
  );
}
