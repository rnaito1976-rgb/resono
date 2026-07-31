import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { backfillNotificationEmailsForMember } from "../src/lib/notifications/match-email";
import { isEmailConfigured } from "../src/lib/notifications/send-email";
import type { Database } from "../src/types/database";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const shouldSend = process.argv.includes("--send");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!isEmailConfigured()) {
  console.error("Missing RESEND_API_KEY or EMAIL_FROM in .env.local");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function hasProfileActivity(member: {
  portrait: unknown;
  music: unknown;
  looking_for: unknown;
}): boolean {
  const portrait = (member.portrait ?? {}) as {
    dialogueCompleted?: boolean;
    bio?: string;
  };
  const music = (member.music ?? {}) as {
    favoriteArtists?: unknown[];
    instruments?: unknown[];
  };
  const lookingFor = (member.looking_for ?? {}) as {
    parts?: unknown[];
  };

  return (
    portrait.dialogueCompleted === true ||
    Boolean(portrait.bio?.trim()) ||
    (music.favoriteArtists?.length ?? 0) > 0 ||
    (music.instruments?.length ?? 0) > 0 ||
    (lookingFor.parts?.length ?? 0) > 0
  );
}

async function fetchMembersWithPastActions(): Promise<{ id: string; name: string }[]> {
  const { data: members, error } = await supabase
    .from("members")
    .select("id, name, portrait, music, looking_for")
    .not("user_id", "is", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const profileActive = (members ?? []).filter(hasProfileActivity);
  const activeIds = new Set(profileActive.map((member) => member.id));

  const [{ data: resonanceRows }, { data: liveRows }] = await Promise.all([
    supabase.from("resonances").select("from_member_id, to_member_id"),
    supabase.from("live_events").select("actor_member_id"),
  ]);

  for (const row of resonanceRows ?? []) {
    activeIds.add(row.from_member_id);
    activeIds.add(row.to_member_id);
  }

  for (const row of liveRows ?? []) {
    if (row.actor_member_id) {
      activeIds.add(row.actor_member_id);
    }
  }

  return (members ?? [])
    .filter((member) => activeIds.has(member.id))
    .map((member) => ({ id: member.id, name: member.name }));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const actors = await fetchMembersWithPastActions();

  if (actors.length === 0) {
    console.log("No registered members with past actions found.");
    return;
  }

  console.log(
    shouldSend
      ? `Sending notification emails for ${actors.length} member(s)...`
      : `Dry run: ${actors.length} member(s) with past actions`
  );

  let totalSent = 0;
  let totalSkipped = 0;

  for (const [index, actor] of actors.entries()) {
    if (!shouldSend) {
      console.log(`- ${actor.name} (${actor.id})`);
      continue;
    }

    const result = await backfillNotificationEmailsForMember(actor.id, { force: true });
    totalSent += result.sent;
    totalSkipped += result.skipped;

    console.log(
      `[${index + 1}/${actors.length}] ${result.actorName}: sent ${result.sent}, skipped ${result.skipped}`
    );

    await sleep(500);
  }

  if (shouldSend) {
    console.log(`Done. Sent ${totalSent} email(s), skipped ${totalSkipped}.`);
  } else {
    console.log("Run with --send to deliver emails.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
