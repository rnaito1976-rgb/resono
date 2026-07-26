import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase.from("resonance_match_cache").select("viewer_member_id").limit(1);

  if (!error) {
    console.log("Migration 013 OK: resonance_match_cache exists");
    return;
  }

  const migrationPath = resolve(
    process.cwd(),
    "supabase/migrations/013_resonance_match_cache.sql"
  );
  const sql = readFileSync(migrationPath, "utf8");

  console.error(
    "Migration 013 is not applied. Run this SQL in Supabase SQL Editor:\n\n" + sql
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
