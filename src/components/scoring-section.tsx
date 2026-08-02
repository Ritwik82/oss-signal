"use client";

import { motion } from "framer-motion";
import { ScrollSection, StaggerGroup, StaggerItem } from "./scroll-section";

const signals = [
  {
    id: "S-01",
    name: "Recency",
    weight: "0.24",
    dotClass: "signal-dot-green",
    description:
      "Days since the last push, decaying to zero over a 90-day window. Fresh activity signals a living project.",
    formula: "recency = 1 − days_since_push / 90, clamped [0, 1]",
  },
  {
    id: "S-02",
    name: "Momentum",
    weight: "0.20",
    dotClass: "signal-dot-blue",
    description:
      "Star velocity relative to repo age — rewards sustained growth over flash-in-the-pan spikes. Normalized against the run's best performer.",
    formula: "momentum = ln(1 + stars) / ln(1 + age_days), scaled to run max",
  },
  {
    id: "S-03",
    name: "Issue Health",
    weight: "0.16",
    dotClass: "signal-dot-purple",
    description:
      "Open-issue load as a maintenance proxy. Zero open issues is ideal; a large backlog drags the signal down.",
    formula: "issue_health = steps(open_issues): 0 → 1.0 · <10 → 0.8 · <50 → 0.6 · <100 → 0.4 · else 0.2",
  },
  {
    id: "S-04",
    name: "Contributors",
    weight: "0.12",
    dotClass: "signal-dot-orange",
    description:
      "More contributors means a healthier, bus-factor-resistant community. Capped at 20 for scoring.",
    formula: "contributors = min(count, 20) / 20",
  },
  {
    id: "S-05",
    name: "License",
    weight: "0.08",
    dotClass: "signal-dot-pink",
    description:
      "Whether the project declares an open-source license. Legal clarity matters for actually using the code.",
    formula: "license = 1 if SPDX present, else 0",
  },
  {
    id: "S-06",
    name: "Abandonment Risk ↓",
    weight: "0.20",
    dotClass: "signal-dot-red",
    description:
      "Inverted: starts costing points once a repo sits idle past 14 days, fully consumed by day 90. Your time is the resource this signal protects — stale apps don't get to ride on moment.",
    formula: "risk = 0 (<14d) ramping to 1 (≥90d) · score uses (1 − risk)",
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="calibration-marks w-8" />
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "var(--color-text-dim)" }}
            >
              Section 02 / Methodology
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Six signals.
            <br />
            <span style={{ color: "var(--color-text-muted)" }}>One honest score.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base max-w-xl leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            No black boxes. Each project is scored on six weighted health
            signals, combined into a single 1–10 score you can actually reason
            about. Weight #6 inverts abandonment risk — stale repos score lower,
            not hidden.
          </motion.p>
        </div>

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
                    <div className={`w-2.5 h-2.5 rounded-full ${signal.dotClass}`} />

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
                      w={signal.weight}
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {signal.description}
                  </p>

                  {/* Formula */}
                  <p
                    className="font-mono text-[11px] tracking-wide"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    {signal.formula}
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
          <p
            className="font-mono text-sm"
            style={{ color: "var(--color-text)" }}
          >
            score = Σ(signal_i × weight_i) × 10 → normalized to [0, 10]
          </p>
        </motion.div>
      </div>
    </ScrollSection>
  );
}
