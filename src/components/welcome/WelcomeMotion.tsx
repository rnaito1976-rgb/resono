"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ease = [0.25, 0.1, 0.25, 1] as const;

type WelcomeMotionProps = {
  children: ReactNode;
  className?: string;
  stepKey: string;
};

export function WelcomeMotion({ children, className, stepKey }: WelcomeMotionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
      transition={{ duration: 0.45, ease }}
      className={cn("flex min-h-0 flex-1 flex-col", className)}
    >
      {children}
    </motion.div>
  );
}

export function WelcomeFade({ children, className }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
