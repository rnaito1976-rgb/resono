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
  const { data, error } = await supabase.rpc("get_unread_message_count", {
    p_member_id: "__migration_check__",
  });

  if (!error && typeof data === "number") {
    console.log("Migration 017 OK: get_unread_message_count returns", data);
    return;
  }

  const migrationPath = resolve(
    process.cwd(),
    "supabase/migrations/017_unread_message_count_rpc.sql"
  );
  const sql = readFileSync(migrationPath, "utf8");

  console.error(
    "Migration 017 is not applied. Run this SQL in Supabase SQL Editor:\n\n" + sql
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
