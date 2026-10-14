"use client";

import { Fragment } from "react";
import { MotionConfig, motion, type Variants } from "motion/react";

type HeroContentProps = {
  eyebrow: string;
  titleBeforeHighlight: string;
  titleHighlight: string;
  titleAfterHighlight: string;
  subtitle: string;
};

const GLOW_REST = "0 0 24px oklch(0.702 0.2 45.1 / 55%)";
const GLOW_PEAK = "0 0 40px oklch(0.702 0.2 45.1 / 90%)";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function Words({ text }: { text: string }) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word, index) => (
      <Fragment key={index}>
        <motion.span variants={rise} className="inline-block">
          {word}
        </motion.span>{" "}
      </Fragment>
    ));
}

export function HeroContent({
  eyebrow,
  titleBeforeHighlight,
  titleHighlight,
  titleAfterHighlight,
  subtitle,
}: HeroContentProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div variants={container} initial="hidden" animate="visible">
        <motion.p
          variants={rise}
          className="text-sm font-semibold tracking-widest text-primary uppercase"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          variants={container}
          className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          <Words text={titleBeforeHighlight} />
          <motion.span variants={rise} className="inline-block">
            <motion.span
              className="inline-block text-primary"
              style={{ textShadow: GLOW_REST }}
              animate={{ textShadow: [GLOW_REST, GLOW_PEAK, GLOW_REST] }}
              transition={{
                duration: 3,
                delay: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {titleHighlight}
            </motion.span>
          </motion.span>{" "}
          <Words text={titleAfterHighlight} />
        </motion.h1>
        <motion.p
          variants={rise}
          className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          {subtitle}
        </motion.p>
      </motion.div>
    </MotionConfig>
  );
}
