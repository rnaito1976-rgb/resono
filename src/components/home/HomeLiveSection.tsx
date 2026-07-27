import { HomeLiveFeed } from "@/components/home/HomeLiveFeed";
import { getLiveEvents } from "@/lib/live/events";

export async function HomeLiveSection() {
  const events = await getLiveEvents(20);
  return <HomeLiveFeed events={events} />;
}
