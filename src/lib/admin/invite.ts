import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export type AdminInviteResult = {
  success: boolean;
  message: string;
  email: string;
  role: AppRole;
  loginUrl: string;
  emailSent: boolean;
  tempPassword: string | null;
};

export async function inviteAdminUser(email: string, role: AppRole) {
  const { data, error } = await supabase.functions.invoke("admin-invite", {
    body: { email: email.trim().toLowerCase(), role },
  });

  if (error) {
    throw new Error(error.message || "Could not send admin invite");
  }

  const payload = data as AdminInviteResult & { error?: string };
  if (payload?.error) {
    throw new Error(payload.error);
  }

  if (!payload?.success) {
    throw new Error(payload?.message || "Invite failed");
  }

  return payload;
}

export async function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error("Clipboard not available");
}
