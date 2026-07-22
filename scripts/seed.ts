import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { members } from "../src/data/members";
import { memberToRow } from "../src/lib/supabase/mappers";
import type { Database } from "../src/types/database";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

async function seed() {
  const rows = members.map(memberToRow);
  const { error } = await supabase.from("members").upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${rows.length} members to Supabase.`);
}

seed();
