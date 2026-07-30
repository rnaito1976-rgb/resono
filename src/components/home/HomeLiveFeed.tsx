"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { formatRelativeTime, isLiveEventNew } from "@/lib/live/time";
import { buildLoginHref } from "@/lib/navigation/login-redirect";
import { NO_PHOTO_URL } from "@/lib/onboarding/status";
import { useProfileSheetOptional } from "@/providers/ProfileSheetProvider";
import { cn } from "@/lib/utils";
import {
  LIVE_EVENT_KIND_LABELS,
  type LiveEvent,
} from "@/types/live";

const SEEN_STORAGE_KEY = "resono:live-seen-ids";

function getLiveEventMemberId(event: LiveEvent): string | undefined {
  const hrefMatch = event.href.match(/^\/member\/([^/?#]+)/);
  if (hrefMatch?.[1]) {
    return hrefMatch[1];
  }

  if (event.kind === "new_member") {
    return event.actorMemberId;
  }

  return undefined;
}

function readSeenIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = sessionStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>) {
  try {
    sessionStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...ids].slice(-80)));
  } catch {
    // ignore quota
  }
}

type HomeLiveFeedProps = {
  events: LiveEvent[];
};

export function HomeLiveFeed({ events }: HomeLiveFeedProps) {
  const profileSheet = useProfileSheetOptional();
  const [animateIds, setAnimateIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (events.length === 0) {
      return;
    }

    const seen = readSeenIds();
    const fresh = events.filter((event) => !seen.has(event.id)).map((event) => event.id);

    if (fresh.length > 0) {
      setAnimateIds(new Set(fresh));
      for (const id of fresh) {
        seen.add(id);
      }
      writeSeenIds(seen);
    }
  }, [events]);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Live
        </p>
        <h2 className="mt-2 text-[22px] font-light tracking-tight text-white">
          Latest Activity
        </h2>
      </div>

      {events.length === 0 ? (
        <p className="text-[14px] leading-relaxed text-white/40">
          直近48時間の動きはまだありません
        </p>
      ) : (
        <div className="-mx-5 overflow-x-auto overscroll-x-contain scrollbar-hide">
          <div className="flex w-max gap-3 px-5 pb-1">
            {events.map((event) => (
              <LiveEventCard
                key={event.id}
                event={event}
                animateIn={animateIds.has(event.id)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function LiveEventCardContent({ event }: { event: LiveEvent }) {
  const hasPhoto = Boolean(event.photo && event.photo !== NO_PHOTO_URL);
  const showNewBadge = event.isNew || isLiveEventNew(event.createdAt);

  return (
    <>
      {showNewBadge ? (
        <span className="absolute right-3 top-2.5 text-[9px] font-medium uppercase tracking-[0.16em] text-primary">
          NEW
        </span>
      ) : null}

      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-white/[0.06]">
        {hasPhoto ? (
          <Image
            src={event.photo!}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] tracking-[0.12em] text-white/30">
            {event.kind === "new_video" || event.kind === "new_band" || event.kind === "band_formed"
              ? "BAND"
              : "NEW"}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
          {LIVE_EVENT_KIND_LABELS[event.kind]}
        </p>
        <p className="mt-1 truncate text-[15px] leading-snug text-white">
          {event.title}
        </p>
        <p className="mt-1 text-[12px] text-white/40">
          {formatRelativeTime(event.createdAt)}
        </p>
      </div>
    </>
  );
}

function LiveEventCard({
  event,
  animateIn,
}: {
  event: LiveEvent;
  animateIn: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuthUser();
  const profileSheet = useProfileSheetOptional();
  const loginHref = buildLoginHref(pathname);

  const memberId = getLiveEventMemberId(event);
  const opensInSheet = Boolean(memberId && profileSheet);

  const className = cn(
    "relative flex h-[88px] w-[220px] shrink-0 items-center gap-3 rounded-[20px] border border-border/80 bg-white/[0.03] px-3.5 py-3 text-left transition-quiet active:opacity-80",
    animateIn && "animate-live-fade-in"
  );

  function handleOpenMember() {
    if (!memberId) {
      return;
    }

    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }

    profileSheet?.openProfile(memberId);
  }

  if (opensInSheet) {
    return (
      <button type="button" onClick={handleOpenMember} className={className}>
        <LiveEventCardContent event={event} />
      </button>
    );
  }

  return (
    <Link href={event.href} className={className}>
      <LiveEventCardContent event={event} />
    </Link>
  );
}
