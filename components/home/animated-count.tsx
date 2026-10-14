"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { formatCompactCount } from "@/lib/utils";

interface AnimatedCountProps {
  value: number;
  locale: string;
  className?: string;
}

/** Counts up from zero to `value` the first time it scrolls into view. */
export function AnimatedCount({ value, locale, className }: AnimatedCountProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => setCurrent(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, prefersReducedMotion, value]);

  return (
    <p ref={ref} className={className}>
      {formatCompactCount(prefersReducedMotion ? value : current, locale)}
    </p>
  );
}
