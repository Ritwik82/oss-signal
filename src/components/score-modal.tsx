"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { signals } from "./scoring-section";

type ScoreModalContextValue = {
  openScoreModal: () => void;
};

const ScoreModalContext = createContext<ScoreModalContextValue | null>(null);

export function useScoreModal() {
  const ctx = useContext(ScoreModalContext);
  if (!ctx) {
    throw new Error("useScoreModal must be used within ScoreModalProvider");
  }
  return ctx;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ScoreModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, []);

  const openScoreModal = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <ScoreModalContext.Provider value={{ openScoreModal }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="score-modal-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="glass relative w-full max-w-2xl max-h-[85vh] overflow-y-auto border"
            style={{
              borderColor: "var(--color-border)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Corner marks */}
            <div
              className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2"
              style={{ borderColor: "var(--color-accent)" }}
            />
            <div
              className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2"
              style={{ borderColor: "var(--color-accent)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2"
              style={{ borderColor: "var(--color-accent)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2"
              style={{ borderColor: "var(--color-accent)" }}
            />

            {/* Header */}
            <div
              className="flex items-start justify-between gap-4 p-6 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <p
                  className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Methodology / Full Disclosure
                </p>
                <h2
                  id="score-modal-title"
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--color-text)" }}
                >
                  How a score is made
                </h2>
              </div>
              <button
                onClick={close}
                aria-label="Close score explanation"
                className="border px-3 py-1 font-mono text-xs transition-colors hover:opacity-80"
                style={{
                  color: "var(--color-text)",
                  borderColor: "var(--color-border)",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "var(--color-text-muted)" }}
              >
                Each project is scored on six weighted health signals, combined
                into a single 1–10 score. No black boxes — here is every signal,
                its weight, its data source, and why it earns that weight.
              </p>

              <div className="space-y-0 mb-6">
                {signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="border-b py-4 last:border-b-0"
                    style={{ borderColor: "var(--color-ruled)" }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${signal.dotClass}`}
                      />
                      <h3
                        className="text-sm font-bold tracking-tight"
                        style={{ color: "var(--color-text)" }}
                      >
                        {signal.name}
                      </h3>
                      <span
                        className="font-mono text-[10px] font-bold ml-auto px-2 py-0.5 border shrink-0"
                        style={{
                          color: "var(--color-accent)",
                          borderColor: "var(--color-accent-border)",
                          backgroundColor: "var(--color-accent-dim)",
                        }}
                      >
                        {Math.round(parseFloat(signal.weight) * 100)}%
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {signal.description}
                    </p>
                    <p
                      className="font-mono text-[11px] mb-1"
                      style={{ color: "var(--color-text-dim)" }}
                    >
                      {signal.formula}
                    </p>
                    <p
                      className="font-mono text-[10px]"
                      style={{ color: "var(--color-text-dim)" }}
                    >
                      Source: {signal.source}
                    </p>
                    <p
                      className="text-xs leading-relaxed mt-1 italic"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {signal.why}
                    </p>
                  </div>
                ))}
              </div>

              {/* Final score entry */}
              <div
                className="border-2 p-4"
                style={{
                  borderColor: "var(--color-accent-border)",
                  backgroundColor: "var(--color-accent-dim)",
                }}
              >
                <p
                  className="font-mono text-[10px] tracking-widest uppercase mb-1"
                  style={{ color: "var(--color-accent)" }}
                >
                  Final Calculation
                </p>
                <p
                  className="font-mono text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  score = Σ(signal × weight) × 10 → normalized to [1, 10]
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScoreModalContext.Provider>
  );
}
