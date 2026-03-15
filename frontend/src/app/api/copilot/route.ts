import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY ?? "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"}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      stream: true,
      messages,
    }),
  });

  if (!groqRes.ok) {
    const err = await groqRes.json();
    return new Response(JSON.stringify({ error: err }), {
      status: groqRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(groqRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
