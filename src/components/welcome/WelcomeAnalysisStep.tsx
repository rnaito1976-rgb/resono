"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WELCOME_ANALYSIS_STEPS } from "@/lib/welcome/onboarding-data";

type WelcomeAnalysisStepProps = {
  onComplete: () => void;
};

export function WelcomeAnalysisStep({ onComplete }: WelcomeAnalysisStepProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timers = WELCOME_ANALYSIS_STEPS.map((_, index) =>
      window.setTimeout(() => setActiveIndex(index), index * 1400)
    );

    const completeTimer = window.setTimeout(
      () => onComplete(),
      WELCOME_ANALYSIS_STEPS.length * 1400 + 900
    );

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 pb-10 pt-14 text-center">
      <motion.div
        className="mb-10 text-[42px]"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.08, 1],
                rotate: [0, 8, -8, 0],
              }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        ✨
      </motion.div>

      <h2 className="text-[28px] font-light tracking-tight">共鳴を分析しています…</h2>

      <div className="mt-12 w-full max-w-sm space-y-4">
        {WELCOME_ANALYSIS_STEPS.map((step, index) => {
          const isActive = index <= activeIndex;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0.35, y: 8 }}
              animate={{
                opacity: isActive ? 1 : 0.35,
                y: isActive ? 0 : 8,
              }}
              transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-[24px] border border-border bg-subtle px-5 py-4 text-left"
            >
              <p className="text-[15px]">
                <span className="mr-2">{step.emoji}</span>
                {step.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
