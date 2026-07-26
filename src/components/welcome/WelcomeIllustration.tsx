"use client";

import { motion, useReducedMotion } from "framer-motion";

export function WelcomeIllustration() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full bg-primary/10 blur-2xl"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: [0.45, 0.7, 0.45],
              }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.svg
        viewBox="0 0 120 120"
        className="relative h-36 w-36 text-primary"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        aria-hidden
      >
        <motion.g
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  rotate: [-2, 2, -2],
                }
          }
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "60px", originY: "72px" }}
        >
          <path
            d="M34 78c8-18 22-28 40-28 8 0 14 2 19 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="28" y="72" width="58" height="14" rx="7" fill="currentColor" opacity="0.85" />
          <rect x="82" y="66" width="10" height="26" rx="3" fill="currentColor" opacity="0.65" />
          <circle cx="92" cy="58" r="8" fill="currentColor" />
          <path
            d="M48 79v-34M56 79v-28M64 79v-32M72 79v-24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
        </motion.g>

        <motion.circle
          cx="88"
          cy="42"
          r="4"
          fill="currentColor"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [0.35, 1, 0.35],
                  scale: [0.9, 1.15, 0.9],
                }
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>

      <span className="absolute -bottom-1 text-[28px]" aria-hidden>
        🎸
      </span>
    </div>
  );
}
