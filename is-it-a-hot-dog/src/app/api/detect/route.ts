import { NextResponse } from "next/server";

export const runtime = "nodejs";

type HfConcept = { label: string; score: number };

function stripDataUrlPrefix(base64: string) {
  const commaIdx = base64.indexOf(",");
  if (base64.startsWith("data:") && commaIdx !== -1) return base64.slice(commaIdx + 1);
  return base64;
}

export async function POST(request: Request) {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Missing HUGGINGFACE_TOKEN env var." },
      { status: 500 },
    );
  }

  let imageBase64: unknown;
  try {
    const body = (await request.json()) as { imageBase64?: unknown };
    imageBase64 = body?.imageBase64;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return NextResponse.json(
      { error: "Expected JSON body: { imageBase64: string }" },
      { status: 400 },
    );
  }

  const rawBase64 = stripDataUrlPrefix(imageBase64);
  let imageBuffer: Buffer;
  try {
    imageBuffer = Buffer.from(rawBase64, "base64");
  } catch {
    return NextResponse.json({ error: "Could not decode base64 image." }, { status: 400 });
  }

  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      method: "POST",
      // Next's TS types for fetch body don't always accept Node.js Buffer directly.
      // A Uint8Array is a standards-friendly binary body.
      body: new Uint8Array(imageBuffer),
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Hugging Face inference request failed.",
        status: response.status,
        details: text || response.statusText,
      },
      { status: 502 },
    );
  }

  const concepts = (await response.json()) as unknown;
  if (!Array.isArray(concepts)) {
    return NextResponse.json(
      { error: "Unexpected Hugging Face response format." },
      { status: 502 },
    );
  }

  const parsed: HfConcept[] = concepts
    .filter(
      (c): c is HfConcept =>
        typeof c === "object" &&
        c !== null &&
        "label" in c &&
        "score" in c &&
        typeof (c as { label: unknown }).label === "string" &&
        typeof (c as { score: unknown }).score === "number",
    )
    .map((c) => ({ label: c.label, score: c.score }));

  const top = parsed[0];
  const topLabel = (top?.label ?? "").toLowerCase();
  const isHotdog = topLabel.includes("hotdog") || topLabel.includes("hot dog");
  const confidence = top?.score ?? 0;
  const topConcepts = parsed.slice(0, 3);

  return NextResponse.json({ isHotdog, confidence, topConcepts });
}

