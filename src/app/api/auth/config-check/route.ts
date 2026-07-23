import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  let healthStatus: number | null = null;
  if (url && key) {
    try {
      const response = await fetch(`${url}/auth/v1/health`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      });
      healthStatus = response.status;
    } catch {
      healthStatus = null;
    }
  }

  return NextResponse.json({
    configured: Boolean(url && key),
    url,
    keyLength: key.length,
    keyPrefix: key.slice(0, 15),
    keyHash: key
      ? createHash("sha256").update(key).digest("hex").slice(0, 16)
      : null,
    authHealthStatus: healthStatus,
  });
}
