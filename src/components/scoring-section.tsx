"use client";

import { motion } from "framer-motion";
import { ScrollSection, StaggerGroup, StaggerItem } from "./scroll-section";

const signals = [
  {
    id: "S-01",
    name: "Recency",
    weight: "0.30",
    dotClass: "signal-dot-green",
    description:
      "How recently the repo was pushed to. Fresh activity signals a living project.",
    formula: "recency = f(last_push, 90d_window)",
  },
  {
    id: "S-02",
    name: "Momentum",
    weight: "0.25",
    dotClass: "signal-dot-blue",
    description:
      "Stars relative to repo age. Rewards sustained growth over flash-in-the-pan spikes.",
    formula: "momentum = stars / max(age_months, 1)",
  },
  {
    id: "S-03",
    name: "Issue Health",
    weight: "0.20",
    dotClass: "signal-dot-purple",
    description:
      "What fraction of recent issues get closed. Healthy teams resolve problems.",
    formula: "issue_health = closed_30d / total_30d",
  },
  {
    id: "S-04",
    name: "Contributors",
    weight: "0.15",
    dotClass: "signal-dot-orange",
    description:
      "More contributors means a healthier, bus-factor-resistant community.",
    formula: "contributors = log2(contributor_count + 1)",
  },
  {
    id: "S-05",
    name: "License",
    weight: "0.10",
    dotClass: "signal-dot-pink",
    description:
      "Whether the project has a declared open-source license. Legal clarity matters.",
    formula: "license = has_osi_approved ? 1 : 0",
  },
];

export function ScoringSection() {
  return (
    <ScrollSection
      id="notebook"
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
            Five signals.
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
            No black boxes. Each project is scored on five weighted health
            signals, combined into a single 1–10 score you can actually reason
            about.
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
            score = Σ(signal_i × weight_i) × 10 → normalized to [1, 10]
          </p>
        </motion.div>
      </div>
    </ScrollSection>
  );
}
