/* eslint-disable @next/next/no-img-element */
"use client";

import { Loader2, RotateCcw, Sparkles, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type TopConcept = { label: string; score: number };
type DetectResponse = {
  isHotdog: boolean;
  confidence: number;
  topConcepts: TopConcept[];
  error?: string;
  details?: string;
};

function toPct(n: number) {
  const clamped = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
  return `${Math.round(clamped * 100)}%`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [reveal, setReveal] = useState(false);

  const canJudge = Boolean(file && imageBase64 && !isProcessing && !result);

  useEffect(() => {
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [file]);

  useEffect(() => {
    if (!result) return;
    setReveal(false);
    const t = window.setTimeout(() => setReveal(true), 40);
    return () => window.clearTimeout(t);
  }, [result]);

  const verdict = useMemo(() => {
    if (!result) return null;
    if (result.error) return "error";
    return result.isHotdog ? "hotdog" : "not";
  }, [result]);

  const verdictSubline = useMemo(() => {
    if (!result || result.error) return "";
    return result.isHotdog
      ? "The Council of Snacks has spoken."
      : "We regret to inform you: that’s just… not the vibe.";
  }, [result]);

  async function onPickFile(nextFile: File | null) {
    setResult(null);
    setReveal(false);
    setFile(nextFile);
    setImageBase64("");
    if (!nextFile) return;
    const dataUrl = await readFileAsDataUrl(nextFile);
    setImageBase64(dataUrl);
  }

  async function judgeIt() {
    if (!imageBase64 || isProcessing) return;
    setIsProcessing(true);
    setResult(null);
    setReveal(false);
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = (await res.json().catch(() => null)) as DetectResponse | null;
      if (!res.ok) {
        setResult(
          data ?? {
            isHotdog: false,
            confidence: 0,
            topConcepts: [],
            error: `Request failed (${res.status}).`,
          },
        );
        return;
      }

      setResult(data);
    } catch (e) {
      setResult({
        isHotdog: false,
        confidence: 0,
        topConcepts: [],
        error: e instanceof Error ? e.message : "Request failed.",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function reset() {
    setIsProcessing(false);
    setResult(null);
    setReveal(false);
    setFile(null);
    setPreviewUrl("");
    setImageBase64("");
    inputRef.current?.focus();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (!f) return;
    void onPickFile(f);
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-50 font-sans text-zinc-950 dark:bg-[#070711] dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.25),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(74,222,128,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] bg-size-[18px_18px]" />
      </div>

      <main className="relative w-full max-w-xl px-4 py-10 sm:px-6">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
            <Sparkles className="h-4 w-4" />
            powered by vibes (and a ViT)
          </div>
          <h1 className="text-balance text-4xl font-black tracking-tight sm:text-6xl">
            Is it a{" "}
            <span className="bg-linear-to-r from-emerald-400 via-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
              Hot Dog
            </span>
            ?
          </h1>
          <p className="mt-3 text-pretty text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Upload a photo. We will consult the{" "}
            <span className="font-semibold">Snack Oracle</span> and deliver a totally serious verdict.
          </p>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white/85 p-4 shadow-xl shadow-fuchsia-500/10 backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-6">
          <div
            className={[
              "group relative flex min-h-44 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-5 text-center transition-colors",
              isDragging
                ? "border-fuchsia-400 bg-fuchsia-500/10"
                : "border-zinc-300 bg-white/60 hover:bg-white/80 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
              result ? "pointer-events-none opacity-60" : "",
            ].join(" ")}
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
              disabled={Boolean(result) || isProcessing}
            />

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-sm transition-transform group-hover:-rotate-3 group-hover:scale-[1.06] dark:border-white/10 dark:bg-white/10">
              <Upload className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-300" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drag & drop a snack photo, or{" "}
                <span className="font-semibold text-fuchsia-600 dark:text-fuchsia-300">
                  choose one
                </span>
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Bonus points for ketchup. PNG/JPG/WebP welcome.
              </p>
            </div>
          </div>

          {previewUrl ? (
            <div className="mt-5 overflow-hidden rounded-xl border border-black/5 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <img
                src={previewUrl}
                alt={file?.name ? `Preview: ${file.name}` : "Uploaded preview"}
                className="h-auto w-full object-contain"
              />
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              className={[
                "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold tracking-wide transition-all",
                canJudge
                  ? "bg-linear-to-r from-emerald-400 via-cyan-300 to-fuchsia-300 text-black shadow-lg shadow-fuchsia-500/20 hover:brightness-110 active:scale-[0.99]"
                  : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-400",
              ].join(" ")}
              onClick={() => void judgeIt()}
              disabled={!canJudge}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Consulting the Snack Oracle...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  JUDGE MY SNACK
                </>
              )}
            </button>

            <button
              className={[
                "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors sm:w-auto",
                file || result
                  ? "border-black/10 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-zinc-50 dark:hover:bg-white/10"
                  : "cursor-not-allowed border-black/5 bg-white/40 text-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500",
              ].join(" ")}
              onClick={reset}
              disabled={!file && !result}
            >
              <RotateCcw className="h-4 w-4" />
              Try Another Snack
            </button>
          </div>

          {result ? (
            <div
              className={[
                "mt-6 rounded-xl border p-4 transition-all duration-500",
                reveal
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-2 scale-[0.98] opacity-0",
                verdict === "hotdog"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : verdict === "not"
                    ? "border-rose-500/30 bg-rose-500/10"
                    : "border-amber-500/30 bg-amber-500/10",
              ].join(" ")}
            >
              {verdict === "error" ? (
                <div>
                  <p className="text-sm font-semibold text-amber-300">Something went wrong.</p>
                  <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                    {result.error}
                    {result.details ? ` ${result.details}` : ""}
                  </p>
                </div>
              ) : verdict === "hotdog" ? (
                <div className="text-center">
                  <p className="text-4xl font-black tracking-tight text-emerald-400 drop-shadow sm:text-6xl">
                    🌭 HOT DOG!!!
                  </p>
                  <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                    {verdictSubline}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-4xl font-black tracking-tight text-rose-400 drop-shadow sm:text-6xl">
                    ❌ NOT HOT DOG
                  </p>
                  <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                    {verdictSubline}
                  </p>
                </div>
              )}

              {!result.error ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Confidence (aka vibe-check score)
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{toPct(result.confidence)}</p>
                  </div>
                  <div className="rounded-lg border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Top 3 guesses (the receipts)
                    </p>
                    <ol className="mt-2 space-y-1 text-xs text-zinc-700 dark:text-zinc-200">
                      {(result.topConcepts ?? []).slice(0, 3).map((c, idx) => (
                        <li key={`${c.label}-${idx}`} className="flex items-baseline justify-between gap-2">
                          <span className="line-clamp-1">{c.label}</span>
                          <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                            {toPct(c.score)}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <footer className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
          Built for a hackathon demo. Try “corn dog” for maximum chaos.
        </footer>
      </main>
    </div>
  );
}
