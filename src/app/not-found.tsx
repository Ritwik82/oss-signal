import Link from "next/link";
export default function NotFound() {
  return (
    <div id="main-content" className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: "var(--color-text-dim)" }}>
        404 — Specimen not catalogued
      </p>
      <h1 className="text-3xl font-bold tracking-tight serif-display mb-3" style={{ color: "var(--color-text)" }}>
        No record for this ID.
      </h1>
      <p className="text-sm leading-relaxed max-w-lg mx-auto mb-8" style={{ color: "var(--color-text-muted)" }}>
        The project ID doesn&apos;t match any entry in <span className="font-mono">projects.json</span>. It may have been removed, or the URL is mis-copied.
      </p>
      <Link href="/" className="font-mono text-xs border px-4 py-2 inline-flex items-center gap-2" style={{ borderColor: "var(--color-accent-border)", color: "var(--color-accent)", backgroundColor: "var(--color-accent-dim)" }}>
        ← Back to archive
      </Link>
    </div>
  );
}
