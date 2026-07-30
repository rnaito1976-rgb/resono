import { HomeLiveFeed } from "@/components/home/HomeLiveFeed";
import { getLiveEvents } from "@/lib/live/events";
import { LIVE_FEED_SIZE } from "@/types/live";

export async function HomeLiveSection() {
  const events = await getLiveEvents(LIVE_FEED_SIZE);
  return <HomeLiveFeed events={events} />;
}
