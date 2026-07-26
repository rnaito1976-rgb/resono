"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WELCOME_ANALYSIS_STEPS } from "@/lib/welcome/onboarding-data";

type WelcomeAnalysisStepProps = {
  onComplete: () => void;
};

export function WelcomeAnalysisStep({ onComplete }: WelcomeAnalysisStepProps) {
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
    <div className="flex min-h-dvh flex-col justify-center px-5 pb-10 pt-6">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Analysis
        </p>
        <h2 className="mt-1 text-[28px] font-light tracking-tight">共鳴を分析しています…</h2>

        <div className="mt-10 space-y-3">
          {WELCOME_ANALYSIS_STEPS.map((label, index) => {
            const isActive = index <= activeIndex;

            return (
              <motion.div
                key={label}
                initial={{ opacity: 0.35, y: 6 }}
                animate={{
                  opacity: isActive ? 1 : 0.35,
                  y: isActive ? 0 : 6,
                }}
                transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                className="py-1"
              >
                <p className="text-[15px] leading-relaxed text-white/80">{label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
