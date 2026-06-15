import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getNewsletterSupabaseConfig() {
  const url = readEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  const publishableKey = readEnv(
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
  );

  return { url, serviceRoleKey, publishableKey };
}

export type SaveSubscriberResult =
  | { ok: true; email: string; createdAt: string }
  | { ok: false; duplicate: true }
  | { ok: false; duplicate: false; message: string; code?: string };

export async function saveNewsletterSubscriber(email: string): Promise<SaveSubscriberResult> {
  const { url, serviceRoleKey, publishableKey } = getNewsletterSupabaseConfig();

  if (!url) {
    console.error("[newsletter] Missing SUPABASE_URL (or VITE_SUPABASE_URL) on server.");
    return {
      ok: false,
      duplicate: false,
      message: "Server Supabase URL is not configured.",
    };
  }

  if (serviceRoleKey) {
    const admin = createClient<Database>(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin
      .from("newsletter_subscribers")
      .insert({ email })
      .select("email, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: false, duplicate: true };
      }
      console.error("[newsletter] Service-role insert failed:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return {
        ok: false,
        duplicate: false,
        message: error.message,
        code: error.code,
      };
    }

    console.info("[newsletter] Subscriber saved (service role):", email);
    return { ok: true, email: data.email, createdAt: data.created_at };
  }

  if (!publishableKey) {
    console.error(
      "[newsletter] Missing SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PUBLISHABLE_KEY on server.",
    );
    return {
      ok: false,
      duplicate: false,
      message: "Server Supabase credentials are not configured.",
    };
  }

  // Anon insert: RLS allows INSERT but not SELECT, so do not chain .select().
  const anon = createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await anon.from("newsletter_subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, duplicate: true };
    }
    console.error("[newsletter] Anon insert failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return {
      ok: false,
      duplicate: false,
      message: error.message,
      code: error.code,
    };
  }

  const createdAt = new Date().toISOString();
  console.info("[newsletter] Subscriber saved (anon key):", email);
  return { ok: true, email, createdAt };
}
