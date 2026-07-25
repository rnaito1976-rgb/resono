"use client";

import { useEffect, useState } from "react";
import { BandListItem } from "@/components/bands/BandsEmptyState";
import { getBandUnreadSummaryAction } from "@/lib/actions/bands";
import type { Band } from "@/types/band";

type BandsListProps = {
  bands: Band[];
};

export function BandsList({ bands }: BandsListProps) {
  const [unreadByBandId, setUnreadByBandId] = useState<Record<string, number>>({});

  useEffect(() => {
    void getBandUnreadSummaryAction().then((summary) => {
      setUnreadByBandId(summary.byBandId);
    });
  }, []);

  return (
    <div className="space-y-4 px-5 pb-8">
      {bands.map((band) => (
        <BandListItem
          key={band.id}
          band={band}
          unreadCount={unreadByBandId[band.id] ?? 0}
        />
      ))}
    </div>
  );
}
