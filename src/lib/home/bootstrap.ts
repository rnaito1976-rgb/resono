import type { User } from "@supabase/supabase-js";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { MembersFeedPage } from "@/lib/members/feed";
import type { Member } from "@/types/member";

export type HomeBootstrapPayload = {
  user: Pick<User, "id" | "email"> | null;
  member: Member | null;
  feed: MembersFeedPage;
  frequencyColor: FrequencyColorHex;
  redirect: string | null;
};
