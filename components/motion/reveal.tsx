"use client";

import { MotionConfig, motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

// The variant's own transition overrides the `transition` prop, so a delay
// must travel through `custom`. It is omitted when unset so a parent's
// `staggerChildren` delay still applies.
const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay?: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", ...(delay ? { delay } : {}) },
  }),
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Lifts the content slightly on hover. */
  hoverLift?: boolean;
}

/** Fades and slides its content up the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  hoverLift = false,
}: RevealProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        variants={rise}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        custom={delay}
        whileHover={hoverLift ? { y: -4 } : undefined}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

/** Reveals each `StaggerItem` child in sequence once the group is in view. */
export function Stagger({ children, className, stagger = 0.1 }: StaggerProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ visible: { transition: { staggerChildren: stagger } } }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Lifts the item slightly on hover. */
  hoverLift?: boolean;
}

export function StaggerItem({
  children,
  className,
  hoverLift = false,
}: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={rise}
      whileHover={hoverLift ? { y: -4 } : undefined}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: ReactNode;
  className?: string;
}

/** Pops its content in with a soft spring on mount. */
export function ScaleIn({ children, className }: ScaleInProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
