import { NextResponse } from "next/server";
import { buildGenerationRequest } from "../../../../lib/listing-generation.js";
import { localGenerate } from "../../../../lib/local-listing-generation.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { market, kind, prompt, product } = body || {};
    if (!market || !kind || !prompt) {
      return NextResponse.json({ error: "market, kind and prompt are required" }, { status: 400 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ output: localGenerate({ market, kind, product, prompt }), mode: "local" });
    }
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const payload = buildGenerationRequest({ market, kind, prompt, product });
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: payload.system }, { role: "user", content: payload.user }],
        temperature: 0.7
      })
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || "AI generation failed" }, { status: response.status });
    return NextResponse.json({ output: data?.choices?.[0]?.message?.content || "" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI generation failed" }, { status: 500 });
  }
}
