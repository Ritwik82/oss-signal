"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const SETTLE_MS = 1400;

export function CalibrationScan() {
  const reduce = useReducedMotion();
  const mounted = useRef(false);

  useEffect(() => {
    if (reduce) return;
    if (mounted.current) return;
    mounted.current = true;

    const target = document.querySelector("#main-content");
    if (target) target.classList.add("calibrating");

    const t = setTimeout(() => {
      target?.classList.remove("calibrating");
    }, SETTLE_MS);

    return () => {
      clearTimeout(t);
      target?.classList.remove("calibrating");
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div className="calibration-scan" aria-hidden="true">
      <div className="sweep-line calibration-sweep" />
    </div>
  );
}