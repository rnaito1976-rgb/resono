import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { members } from "../src/data/members";
import {
  resolveProfileAiIntro,
  type IntroAngle,
} from "../src/lib/profile/ai-comment";
import { rowToMemberDetail } from "../src/lib/supabase/mappers";
import type { Database } from "../src/types/database";
import type { Member } from "../src/types/member";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function applyRotation(items: Member[]): Member[] {
  let previousAngle: IntroAngle | undefined;

  return items.map((member) => {
    const { angle, comment } = resolveProfileAiIntro(member, {
      avoidAngle: previousAngle,
    });
    previousAngle = angle;
    return { ...member, aiComment: comment };
  });
}

async function regenerateSeedFile() {
  const updated = applyRotation(members);
  const seedPath = resolve(process.cwd(), "src/data/members.ts");
  let content = readFileSync(seedPath, "utf8");

  for (const member of updated) {
    const escapedComment = member.aiComment.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const pattern = new RegExp(
      `(id: "${member.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?aiComment: ")[^"]*(")`
    );
    content = content.replace(pattern, `$1${escapedComment}$2`);
  }

  writeFileSync(seedPath, content, "utf8");
  console.log(`Updated ${updated.length} seed members in src/data/members.ts`);
}

async function regenerateSeedPreview() {
  const updated = applyRotation(members);

  console.log("\n--- Seed members preview ---");
  for (const member of updated) {
    console.log(`${member.name}: ${member.aiComment}`);
  }
}

async function regenerateDatabase() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch members:", error.message);
    process.exit(1);
  }

  let previousAngle: IntroAngle | undefined;
  let updatedCount = 0;

  for (const row of data ?? []) {
    const member = rowToMemberDetail(row);
    const { angle, comment } = resolveProfileAiIntro(member, {
      avoidAngle: previousAngle,
    });
    previousAngle = angle;

    const { error: updateError } = await supabase
      .from("members")
      .update({ ai_comment: comment })
      .eq("id", member.id);

    if (updateError) {
      console.error(`Failed to update ${member.name}:`, updateError.message);
      continue;
    }

    updatedCount += 1;
    console.log(`${member.name}: ${comment}`);
  }

  console.log(`\nUpdated ${updatedCount} members in Supabase.`);
}

async function main() {
  const mode = process.argv[2]?.trim() ?? "all";

  if (mode === "seed") {
    await regenerateSeedFile();
    return;
  }

  if (mode === "preview") {
    await regenerateSeedPreview();
    return;
  }

  if (mode === "db") {
    await regenerateDatabase();
    return;
  }

  await regenerateSeedFile();
  await regenerateSeedPreview();
  await regenerateDatabase();
}

main();
