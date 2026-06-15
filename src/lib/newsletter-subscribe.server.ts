import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  readSupabaseAnonKey,
  readSupabaseServiceRoleKey,
  readSupabaseUrl,
  validateSupabasePublicEnv,
  validateSupabaseServiceEnv,
} from "@/lib/env.server";

export function getNewsletterSupabaseConfig() {
  return {
    url: readSupabaseUrl(),
    serviceRoleKey: readSupabaseServiceRoleKey(),
    publishableKey: readSupabaseAnonKey(),
  };
}

export type SaveSubscriberResult =
  | { ok: true; email: string; createdAt: string }
  | { ok: false; duplicate: true }
  | { ok: false; duplicate: false; message: string; code?: string };

export async function saveNewsletterSubscriber(email: string): Promise<SaveSubscriberResult> {
  const { url, serviceRoleKey, publishableKey } = getNewsletterSupabaseConfig();

  if (!url) {
    const publicEnv = validateSupabasePublicEnv();
    console.error("[newsletter]", publicEnv.message);
    return {
      ok: false,
      duplicate: false,
      message: publicEnv.message,
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
    const serviceEnv = validateSupabaseServiceEnv();
    console.error("[newsletter]", serviceEnv.message);
    return {
      ok: false,
      duplicate: false,
      message: serviceEnv.message,
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
