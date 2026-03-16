// ─── api/ai/generate.ts ─────────────────────────────────────────────────────
// Backend proxy for Anthropic Claude API calls
// NEVER expose your API key on the frontend!
//
// This file shows TWO options:
//   1. Express.js endpoint (for Node backends)
//   2. Next.js API route (for Next.js projects)
//
// Pick the one that matches your stack and delete the other.

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 1: Express.js / Node.js
// ═══════════════════════════════════════════════════════════════════════════════

/*
import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = express.Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Set in .env
});

router.post("/api/ai/generate", async (req, res) => {
  try {
    const { system, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: system || "You are a helpful assistant.",
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({ content: textContent });
  } catch (error) {
    console.error("[AI API] Error:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
*/


// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 2: Next.js API Route (app/api/ai/generate/route.ts)
// ═══════════════════════════════════════════════════════════════════════════════

/*
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { system, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: system || "You are a helpful assistant.",
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n");

    return NextResponse.json({ content: textContent });
  } catch (error) {
    console.error("[AI API] Error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
*/


// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 3: Firebase Cloud Function
// ═══════════════════════════════════════════════════════════════════════════════

/*
import * as functions from "firebase-functions";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: functions.config().anthropic.api_key,
});

export const aiGenerate = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  try {
    const { system, prompt } = req.body;
    if (!prompt) { res.status(400).json({ error: "prompt required" }); return; }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: system || "You are a helpful assistant.",
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n");

    res.json({ content: textContent });
  } catch (error) {
    console.error("[AI API] Error:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

