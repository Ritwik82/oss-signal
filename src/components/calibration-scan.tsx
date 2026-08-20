"use client";

import { useReducedMotion } from "framer-motion";

export function CalibrationScan() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div className="calibration-scan" aria-hidden="true">
      <div className="sweep-line calibration-sweep" />
    </div>
  );
}