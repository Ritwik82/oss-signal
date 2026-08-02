"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { RelativeTime } from "./relative-time";

function AnimatedCounter({ target }: { target: number }) {
  const scaled = target * 10;
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = scaled / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= scaled) {
        setCount(scaled);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [scaled]);

  return <span>{count.toFixed(1)}</span>;
}

export function HeroSection({
  topScore,
  lastRefresh,
  projectCount,
  shizukuCount,
}: {
  topScore: number;
  lastRefresh: string;
  projectCount: number;
  shizukuCount: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <section
      id="station"
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden px-4"
    >
      {/* Renaissance painting background */}
      <div className="hero-painting-bg" aria-hidden="true">
        <img
          src="/art/hero-sky.webp"
          alt=""
          width={1920}
          height={1426}
          fetchPriority="high"
        />
      </div>
      {/* Scrim layer for text contrast */}
      <div className="hero-scrim" aria-hidden="true" />

      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 w-full max-w-7xl mx-auto"
      >
        {/* Asymmetric layout — left content, right readout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left column — title + description */}
          <div className="lg:col-span-7 hero-text-backdrop">
            {/* Station label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="calibration-marks w-12" />
                <span
                  className="font-mono text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--bone)" }}
                >
                  Signal Station / Active
                </span>
              </div>
            </motion.div>

            {/* Main title — Renaissance serif display */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="serif-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.9] mb-8"
              style={{ color: "var(--bone)" }}
            >
              Never install
              <br />
              <span className="serif-display-swash text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem]" style={{ color: "var(--gold)" }}>
                Abandonware
              </span>
              <br />
              <span
                className="serif-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal"
                style={{ color: "var(--dusty-blue)" }}
              >
                again
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-base md:text-lg max-w-xl leading-relaxed mb-10"
              style={{ color: "var(--bone)", opacity: 0.8 }}
            >
              Prioritize actively maintained FOSS Android apps. Track the ones you
              rely on and discover the ones worth installing. No gravediggers.
            </motion.p>

            {/* Status bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="status-dot" />
                <span
                  className="font-mono text-[10px] tracking-widest uppercase"
                  style={{ color: "var(--gold)" }}
                >
                  Live Scoring
                </span>
              </div>
              <div
                className="w-px h-3"
                style={{ backgroundColor: "var(--bone)", opacity: 0.3 }}
              />
              <span
                className="font-mono text-[10px] tracking-wider"
                style={{ color: "var(--bone)" }}
              >
                Last refresh: <RelativeTime iso={lastRefresh} />
              </span>
              {shizukuCount > 0 && (
                <>
                  <div
                    className="w-px h-3"
                    style={{ backgroundColor: "var(--bone)", opacity: 0.3 }}
                  />
                  <span
                    className="font-mono text-[10px] tracking-wider"
                    style={{ color: "var(--bone)" }}
                  >
                    {shizukuCount} Shizuku-enabled
                  </span>
                </>
              )}
            </motion.div>
          </div>

          {/* Right column — score readout panel (composited over art) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div
              className="relative border p-8"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)",
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

              {/* Readout label */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="font-mono text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Primary Readout
                </span>
                <div className="status-dot" />
              </div>

              {/* Score display */}
              <div className="mb-8">
                <p
                  className="font-mono text-[10px] tracking-widest uppercase mb-2"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  Peak Score
                </p>
                <p
                  className="text-6xl md:text-7xl font-bold font-mono accent-text"
                >
                  <AnimatedCounter target={topScore} />
                </p>
              </div>

              {/* Divider */}
              <div className="ruled-divider mb-6" />

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p
                    className="font-mono text-[10px] tracking-widest uppercase mb-1"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    Projects
                  </p>
                  <p
                    className="text-2xl font-bold font-mono"
                    style={{ color: "var(--color-text)" }}
                  >
                    {projectCount}
                  </p>
                </div>
                <div>
                  <p
                    className="font-mono text-[10px] tracking-widest uppercase mb-1"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    Signals
                  </p>
                  <p
                    className="text-2xl font-bold font-mono"
                    style={{ color: "var(--color-text)" }}
                  >
                    6
                  </p>
                  <p
                    className="font-mono text-[9px] mt-1"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    incl. risk
                  </p>
                </div>
              </div>

              {/* Bottom calibration */}
              <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                <div className="calibration-marks w-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
