"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export function ScrollTracker() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  if (reduce) return null;

  return (
    <div className="scroll-tracker" aria-hidden="true">
      <motion.div className="scroll-tracker-fill" style={{ scaleY }} />
    </div>
  );
}
