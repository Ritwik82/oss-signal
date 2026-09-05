"use client";

import { motion } from "framer-motion";
import { ScrollSection, StaggerGroup, StaggerItem } from "./scroll-section";

export const signals = [
  {
    id: "S-01",
    name: "Recency",
    weight: "0.24",
    dotClass: "signal-dot-green",
    description:
      "Days since the last push, decaying to zero over a 90-day window. Fresh activity signals a living project.",
    formula: "recency = 1 − days_since_push / 90, clamped [0, 1]",
    source: "GitHub `pushed_at`",
    why: "Stale code is the #1 failure on Android. Anything under 14 days counts as fresh; 90 days of silence reads as gone.",
  },
  {
    id: "S-02",
    name: "Momentum",
    weight: "0.20",
    dotClass: "signal-dot-blue",
    description:
      "Star velocity relative to repo age — rewards sustained growth over flash-in-the-pan spikes. Absolute reference scale, not run-relative.",
    formula: "momentum = ln(1 + stars) / ln(1 + 10 × age_days), clamped [0, 1] (10 stars/day = full marks)",
    source: "GitHub repo `stargazers_count` + `created_at`",
    why: "A busy community keeps a project honest. An absolute curve means a quiet week in the whole catalog can't inflate every repo's score.",
  },
  {
    id: "S-03",
    name: "Issue Health",
    weight: "0.16",
    dotClass: "signal-dot-purple",
    description:
      "Open-issue load as a maintenance proxy, with open pull requests excluded — GitHub counts PRs as issues, which would punish PR-active repos.",
    formula: "issue_health = steps(open_issues − open_prs): 0 → 1.0 · <10 → 0.8 · <50 → 0.6 · <100 → 0.4 · else 0.2",
    source: "GitHub `open_issues_count` − open-PR search count",
    why: "Repos with <10 recent issues default to 0.8 to avoid punishing new or quiet repos; excluding PRs stops healthy review traffic from reading as a bug backlog.",
  },
  {
    id: "S-04",
    name: "Contributors",
    weight: "0.12",
    dotClass: "signal-dot-orange",
    description:
      "More contributors means a healthier, bus-factor-resistant community. Capped at 20 for scoring.",
    formula: "contributors = min(count, 20) / 20",
    source: "GitHub Contributors API",
    why: "One-maintainer projects are one bad week away from abandonment; the cap stops 200-contributor mega-repos from walloping the scale.",
  },
  {
    id: "S-05",
    name: "License",
    weight: "0.08",
    dotClass: "signal-dot-purple",
    description:
      "Whether the project declares an open-source license. Legal clarity matters for actually using the code.",
    formula: "license = 1 if SPDX present, else 0",
    source: "GitHub `license` field",
    why: "No license = can't legally use or redistribute the app. Small weight because it's binary, but it's a hard gate to trust.",
  },
  {
    id: "S-06",
    name: "Abandonment Risk ↓",
    weight: "0.20",
    dotClass: "signal-dot-red",
    description:
      "Inverted: starts costing points once a repo sits idle past 14 days, fully consumed by day 90. Your time is the resource this signal protects — stale apps don't get to ride on momentum.",
    formula: "risk = 0 (<14d) ramping to 1 (≥90d) · score uses (1 − risk)",
    why: "Warns within 14 days but isn't a false-positive on normal release cadence (<7d would cry wolf); 90 days is the loss limit.",
  },
];

export function ScoringSection() {
  return (
    <ScrollSection
      id="methodology"
      className="relative py-24 md:py-32 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header — notebook style */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ color: "var(--color-text)" }}
          >
            How the score works.
            <br />
            <span style={{ color: "var(--color-text-muted)" }}>Six signals. One honest number.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base max-w-xl leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            Every project gets a 1–10 health score from six transparent signals.
            No black boxes — each signal has a clear formula and public data source.
            The final score is a weighted sum, normalized to 0–10.
          </motion.p>
        </div>

        {/* Signal overview bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12 flex flex-wrap gap-2"
          style={{ fontSize: "11px" }}
        >
          {signals.map((signal) => (
            <span
              key={signal.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border"
              style={{
                borderColor: "var(--color-accent-border)",
                backgroundColor: "var(--color-accent-dim)",
                color: "var(--color-accent)",
              }}
            >
              <span className={`w-2 h-2 rounded-full ${signal.dotClass}`} aria-hidden="true" />
              <span className="font-mono tracking-wider">{signal.name}</span>
              <span className="font-mono font-bold ml-1" style={{ color: "var(--color-text)" }}>
                {Math.round(parseFloat(signal.weight) * 100)}%
              </span>
            </span>
          ))}
        </motion.div>

        {/* Notebook entries */}
        <StaggerGroup className="space-y-0">
          {signals.map((signal) => (
            <StaggerItem key={signal.id}>
              <div
                className="relative border-b py-6"
                style={{ borderColor: "var(--color-ruled)" }}
              >
                {/* Margin line */}
                <div
                  className="absolute left-8 top-0 bottom-0 w-px"
                  style={{ backgroundColor: "var(--color-margin)" }}
                />

                <div className="pl-14">
                  {/* Entry header */}
                  <div className="flex items-center gap-4 mb-3">
                    {/* Signal dot */}
                    <div className={`w-2.5 h-2.5 rounded-full ${signal.dotClass}`} aria-hidden="true" />

                    {/* ID + Name */}
                    <span
                      className="font-mono text-[10px] tracking-widest"
                      style={{ color: "var(--color-text-dim)" }}
                    >
                      {signal.id}
                    </span>
                    <h3
                      className="text-lg font-bold tracking-tight"
                      style={{ color: "var(--color-text)" }}
                    >
                      {signal.name}
                    </h3>

                    {/* Weight */}
                    <span
                      className="font-mono text-xs font-bold ml-auto px-2 py-0.5 border"
                      style={{
                        color: "var(--color-accent)",
                        borderColor: "var(--color-accent-border)",
                        backgroundColor: "var(--color-accent-dim)",
                      }}
                    >
                      {Math.round(parseFloat(signal.weight) * 100)}%
                    </span>
                  </div>

                  {/* What it measures */}
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {signal.description}
                  </p>

                  {/* Why it matters */}
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <strong style={{ color: "var(--color-text)" }}>Why it matters:</strong> {signal.why}
                  </p>

                  {/* Formula */}
                  <p
                    className="font-mono text-[11px] tracking-wide"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    {signal.formula}
                  </p>

                  {/* Source */}
                  <p
                    className="font-mono text-[10px] tracking-wide mt-1"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    Source: {signal.source}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Final score entry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 border-2 p-6"
          style={{
            borderColor: "var(--color-accent-border)",
            backgroundColor: "var(--color-accent-dim)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="status-dot" />
            <span
              className="font-mono text-[10px] tracking-widest uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              Final Calculation
            </span>
          </div>
          <p className="font-mono text-sm mb-2" style={{ color: "var(--color-text)" }}>
            score = Σ(signal_i × weight_i) × 10 → normalized to [0, 10]
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            Higher is healthier. A score of 7+ means actively maintained; below 4 signals risk.
          </p>
        </motion.div>
      </div>
    </ScrollSection>
  );
}
