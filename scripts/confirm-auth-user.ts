import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2]?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

if (!email) {
  console.error("Usage: npm run auth:confirm -- user@example.com");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function confirmAuthUser() {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error("Failed to list users:", error.message);
    process.exit(1);
  }

  const user = data.users.find(
    (entry) => entry.email?.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    console.error(`No auth user found for ${email}`);
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });

  if (updateError) {
    console.error("Failed to confirm user:", updateError.message);
    process.exit(1);
  }

  console.log(`Confirmed email for ${email}`);
}

confirmAuthUser();
