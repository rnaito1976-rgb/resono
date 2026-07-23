"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthLogo, AuthTagline } from "@/components/auth/AuthShell";
import { AuthWelcomeActions } from "@/components/auth/AuthWelcomeActions";
import { WelcomeProfileBackdrop } from "@/components/welcome/WelcomeProfileBackdrop";
import type { Member } from "@/types/member";

const STORAGE_KEY = "resono:welcome-hero-seen";
const HERO_DURATION = 3.4;
const easeInOut = [0.45, 0, 0.55, 1] as const;

const BG = "#0A0A0A";
const TEXT = "#F6F6F6";

const BLOB_RADIUS_A = [
  "58% 42% 34% 66% / 58% 34% 66% 42%",
  "44% 56% 68% 32% / 48% 62% 38% 52%",
  "62% 38% 42% 58% / 54% 46% 64% 36%",
  "50% 50% 50% 50% / 50% 50% 50% 50%",
] as const;

const BLOB_RADIUS_B = [
  "42% 58% 66% 34% / 42% 66% 34% 58%",
  "56% 44% 32% 68% / 52% 38% 62% 48%",
  "38% 62% 58% 42% / 46% 54% 36% 64%",
  "50% 50% 50% 50% / 50% 50% 50% 50%",
] as const;

type WelcomeHeroProps = {
  initialUser?: User | null;
  members?: Member[];
};

function ResonanceBlobStage({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[8] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0.85, 0] }}
      transition={{
        duration: HERO_DURATION,
        times: [0, 0.72, 0.88, 1],
        ease: easeInOut,
      }}
    >
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          width: "100dvh",
          height: "100dvh",
          marginLeft: "-50dvh",
          marginTop: "-50dvh",
          background:
            "radial-gradient(circle at 42% 46%, rgba(94,242,200,0.72) 0%, rgba(96,165,250,0.42) 38%, rgba(94,242,200,0.08) 62%, transparent 74%)",
          filter: "blur(52px)",
          mixBlendMode: "screen",
        }}
        initial={{
          x: "-34vw",
          y: "-6vh",
          scale: 0.88,
          borderRadius: BLOB_RADIUS_A[0],
        }}
        animate={{
          x: ["-34vw", "-26vw", "-8vw", "0vw"],
          y: ["-6vh", "2vh", "-1vh", "0vh"],
          scale: [0.88, 0.96, 1.04, 1.08],
          borderRadius: [...BLOB_RADIUS_A],
          rotate: [-6, 2, -2, 0],
        }}
        transition={{
          duration: HERO_DURATION,
          times: [0, 0.28, 0.62, 1],
          ease: easeInOut,
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          width: "100dvh",
          height: "100dvh",
          marginLeft: "-50dvh",
          marginTop: "-50dvh",
          background:
            "radial-gradient(circle at 58% 54%, rgba(179,136,255,0.68) 0%, rgba(96,165,250,0.4) 36%, rgba(179,136,255,0.1) 64%, transparent 76%)",
          filter: "blur(52px)",
          mixBlendMode: "screen",
        }}
        initial={{
          x: "34vw",
          y: "6vh",
          scale: 0.88,
          borderRadius: BLOB_RADIUS_B[0],
        }}
        animate={{
          x: ["34vw", "26vw", "8vw", "0vw"],
          y: ["6vh", "-2vh", "1vh", "0vh"],
          scale: [0.88, 0.96, 1.04, 1.08],
          borderRadius: [...BLOB_RADIUS_B],
          rotate: [6, -2, 2, 0],
        }}
        transition={{
          duration: HERO_DURATION,
          times: [0, 0.28, 0.62, 1],
          ease: easeInOut,
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[88dvh] w-[88dvh] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(94,242,200,0.42) 0%, rgba(96,165,250,0.34) 34%, rgba(179,136,255,0.28) 58%, transparent 72%)",
          filter: "blur(64px)",
          mixBlendMode: "screen",
        }}
        initial={{ opacity: 0, scale: 0.55 }}
        animate={{
          opacity: [0, 0, 0.55, 0.95, 0.35, 0],
          scale: [0.55, 0.55, 0.95, 1.18, 1.02, 0.92],
        }}
        transition={{
          duration: HERO_DURATION,
          times: [0, 0.48, 0.58, 0.72, 0.84, 0.96],
          ease: easeInOut,
        }}
      />
    </motion.div>
  );
}

export function WelcomeHero({
  initialUser = null,
  members = [],
}: WelcomeHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    const shouldSkip = seen || prefersReducedMotion === true;
    setSkipIntro(shouldSkip);
    setShowBackdrop(shouldSkip);
    setReady(true);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!ready || skipIntro || prefersReducedMotion) {
      return;
    }

    const backdropTimer = window.setTimeout(() => {
      setShowBackdrop(true);
    }, HERO_DURATION * 1000);

    const seenTimer = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }, HERO_DURATION * 1000);

    return () => {
      window.clearTimeout(backdropTimer);
      window.clearTimeout(seenTimer);
    };
  }, [ready, skipIntro, prefersReducedMotion]);

  if (!ready) {
    return <div className="min-h-dvh w-full bg-[#0A0A0A]" aria-hidden />;
  }

  const showIntro = !skipIntro && !prefersReducedMotion;

  return (
    <div
      className="relative mx-auto min-h-dvh w-full max-w-mobile overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT }}
    >
      <WelcomeProfileBackdrop members={members} visible={showBackdrop} />

      {showBackdrop ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/75 via-black/55 to-black/90"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle_at_50%_32%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.78)_72%)]"
          />
        </>
      ) : null}

      <ResonanceBlobStage active={showIntro} />

      <div className="relative z-10 flex min-h-dvh flex-col px-6 pb-10 pt-14">
        <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-6 text-center">
          <motion.div
            initial={{ opacity: skipIntro ? 1 : 0, y: skipIntro ? 0 : 6 }}
            animate={{ opacity: skipIntro ? 1 : [0, 0, 0, 1], y: skipIntro ? 0 : [6, 6, 6, 0] }}
            transition={
              skipIntro
                ? { duration: 0 }
                : { duration: HERO_DURATION, times: [0, 0.72, 0.76, 1], ease: easeInOut }
            }
          >
            <AuthLogo className="text-center text-[#F6F6F6]" />
          </motion.div>

          <motion.div
            initial={{ opacity: skipIntro ? 1 : 0, y: skipIntro ? 0 : 5 }}
            animate={{ opacity: skipIntro ? 1 : [0, 0, 0, 1], y: skipIntro ? 0 : [5, 5, 5, 0] }}
            transition={
              skipIntro
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
          initial={{ opacity: skipIntro ? 1 : 0, y: skipIntro ? 0 : 10 }}
          animate={{ opacity: skipIntro ? 1 : [0, 0, 1], y: skipIntro ? 0 : [10, 10, 0] }}
          transition={
            skipIntro
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
