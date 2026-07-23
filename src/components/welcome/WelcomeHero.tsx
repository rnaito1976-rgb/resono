"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthLogo, AuthTagline } from "@/components/auth/AuthShell";
import { AuthWelcomeActions } from "@/components/auth/AuthWelcomeActions";

const STORAGE_KEY = "resono:welcome-hero-seen";
const HERO_DURATION = 3.2;
const easeInOut = [0.45, 0, 0.55, 1] as const;

const BG = "#0A0A0A";
const TEXT = "#F6F6F6";
const MINT = "#5EF2C8";
const VIOLET = "#B388FF";

type WelcomeHeroProps = {
  initialUser?: User | null;
};

function ResonanceOrb({
  color,
  glow,
  xKeyframes,
  yKeyframes,
  opacityKeyframes,
  scaleKeyframes,
  times,
}: {
  color: string;
  glow: string;
  xKeyframes: number[];
  yKeyframes: number[];
  opacityKeyframes: number[];
  scaleKeyframes: number[];
  times: number[];
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      initial={{ x: xKeyframes[0], y: yKeyframes[0], opacity: opacityKeyframes[0], scale: scaleKeyframes[0] }}
      animate={{ x: xKeyframes, y: yKeyframes, opacity: opacityKeyframes, scale: scaleKeyframes }}
      transition={{ duration: HERO_DURATION, times, ease: easeInOut }}
    >
      <div
        aria-hidden
        className="absolute -left-6 -top-6 h-12 w-12 rounded-full blur-2xl"
        style={{ backgroundColor: glow, opacity: 0.55 }}
      />
      <div
        aria-hidden
        className="relative h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 18px ${color}, 0 0 42px ${glow}`,
        }}
      />
    </motion.div>
  );
}

function ResonanceStage() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div className="relative h-56 w-56">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(94,242,200,0.55) 0%, rgba(96,165,250,0.38) 36%, rgba(179,136,255,0.28) 58%, transparent 76%)`,
            filter: "blur(36px)",
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: [0, 0, 0, 0.92, 0.42, 0.1, 0],
            scale: [0.3, 0.3, 0.3, 1.45, 1.05, 0.82, 0.72],
          }}
          transition={{
            duration: HERO_DURATION,
            times: [0, 0.5, 0.54, 0.66, 0.76, 0.86, 0.94],
            ease: easeInOut,
          }}
        />

        <ResonanceOrb
          color={MINT}
          glow="rgba(94, 242, 200, 0.65)"
          xKeyframes={[-62, -62, -62, -14, 0, 0]}
          yKeyframes={[0, -4, 3, 1, 0, 0]}
          opacityKeyframes={[0, 0.95, 0.95, 0.85, 0.35, 0]}
          scaleKeyframes={[0.82, 1.06, 0.94, 1.08, 0.5, 0.2]}
          times={[0, 0.14, 0.28, 0.54, 0.66, 0.78]}
        />

        <ResonanceOrb
          color={VIOLET}
          glow="rgba(96, 165, 250, 0.55)"
          xKeyframes={[62, 62, 62, 14, 0, 0]}
          yKeyframes={[0, 4, -3, -1, 0, 0]}
          opacityKeyframes={[0, 0.95, 0.95, 0.85, 0.35, 0]}
          scaleKeyframes={[0.82, 1.06, 0.94, 1.08, 0.5, 0.2]}
          times={[0, 0.14, 0.28, 0.54, 0.66, 0.78]}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(94,242,200,0.35) 0%, rgba(96,165,250,0.22) 45%, rgba(179,136,255,0.16) 70%, transparent 100%)`,
            filter: "blur(18px)",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0, 0, 0.75, 0.28, 0],
            scale: [0.5, 0.5, 0.5, 1.15, 0.92, 0.85],
          }}
          transition={{
            duration: HERO_DURATION,
            times: [0, 0.56, 0.6, 0.72, 0.82, 0.92],
            ease: easeInOut,
          }}
        />
      </div>
    </div>
  );
}

function StaticResonanceGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div
        className="h-40 w-40 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(94,242,200,0.4) 0%, rgba(96,165,250,0.24) 42%, rgba(179,136,255,0.18) 68%, transparent 78%)`,
          filter: "blur(32px)",
        }}
      />
    </div>
  );
}

export function WelcomeHero({ initialUser = null }: WelcomeHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [showStatic, setShowStatic] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    setShowStatic(seen || prefersReducedMotion === true);
    setReady(true);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!ready || showStatic || prefersReducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }, HERO_DURATION * 1000);

    return () => window.clearTimeout(timer);
  }, [ready, showStatic, prefersReducedMotion]);

  if (!ready) {
    return <div className="min-h-dvh w-full bg-[#0A0A0A]" aria-hidden />;
  }

  return (
    <div
      className="relative mx-auto min-h-dvh w-full max-w-mobile overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT }}
    >
      {showStatic ? <StaticResonanceGlow /> : <ResonanceStage />}

      <div className="relative z-10 flex min-h-dvh flex-col px-6 pb-10 pt-14">
        <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-6 text-center">
          <motion.div
            initial={{ opacity: showStatic ? 1 : 0, y: showStatic ? 0 : 6 }}
            animate={{ opacity: showStatic ? 1 : [0, 0, 0, 1], y: showStatic ? 0 : [6, 6, 6, 0] }}
            transition={
              showStatic
                ? { duration: 0 }
                : { duration: HERO_DURATION, times: [0, 0.72, 0.76, 1], ease: easeInOut }
            }
          >
            <AuthLogo className="text-center text-[#F6F6F6]" />
          </motion.div>

          <motion.div
            initial={{ opacity: showStatic ? 1 : 0, y: showStatic ? 0 : 5 }}
            animate={{ opacity: showStatic ? 1 : [0, 0, 0, 1], y: showStatic ? 0 : [5, 5, 5, 0] }}
            transition={
              showStatic
                ? { duration: 0 }
                : { duration: HERO_DURATION, times: [0, 0.78, 0.82, 1], ease: easeInOut }
            }
          >
            <AuthTagline className="text-[#F6F6F6]/70" />
            <p className="mx-auto mt-6 max-w-[300px] text-[17px] leading-[1.85] text-[#F6F6F6]/55">
              世界観で共鳴する
              <br />
              ミュージシャンと出会う。
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: showStatic ? 1 : 0, y: showStatic ? 0 : 10 }}
          animate={{ opacity: showStatic ? 1 : [0, 0, 1], y: showStatic ? 0 : [10, 10, 0] }}
          transition={
            showStatic
              ? { duration: 0 }
              : { duration: HERO_DURATION, times: [0, 0.86, 1], ease: easeInOut }
          }
        >
          <AuthWelcomeActions initialUser={initialUser} />
        </motion.div>
      </div>
    </div>
  );
}
