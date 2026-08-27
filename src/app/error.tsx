"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: "var(--color-text-dim)" }}>Section signal lost</p>
      <h2 className="text-2xl font-bold tracking-tight mb-3" style={{ color: "var(--color-text)" }}>This section failed to render.</h2>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>{error.message || "Unknown render error."}</p>
      <button onClick={reset} className="font-mono text-xs border px-4 py-2" style={{ borderColor: "var(--color-accent-border)", color: "var(--color-accent)" }}>Retry section</button>
    </div>
  );
}
