import {
  getAdminNotifyEmails,
  getFromAddress,
  getResendApiKey,
  sendResendEmail,
} from "@/lib/newsletter.server";
import { validateNewsletterEnv, validateSupabasePublicEnv } from "@/lib/env.server";
import { jsonErrorResponse, jsonResponse } from "@/lib/api/json-response.server";
import { getPermissions, type AppRole } from "@/lib/admin/permissions";

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type NewsletterRecipient = { email: string; ok: boolean; error?: string; messageId?: string };

export type NewsletterTestResult =
  | { ok: true; sentAt: string; from: string; recipients: NewsletterRecipient[] }
  | { ok: false; error: string; details?: string; recipients?: NewsletterRecipient[] };

export type NewsletterStatus = {
  resendApiKeyConfigured: boolean;
  from: string;
  fromLooksValid: boolean;
  adminRecipients: string[];
  adminRecipientsValid: boolean;
  envVars: {
    RESEND_API_KEY: boolean;
    NEWSLETTER_FROM_EMAIL: boolean;
    ADMIN_NOTIFICATION_EMAILS: boolean;
  };
  configured: boolean;
  message: string;
};

export function describeNewsletterStatus(): NewsletterStatus {
  const validation = validateNewsletterEnv();
  const apiKey = getResendApiKey();
  const from = getFromAddress();
  const recipients = getAdminNotifyEmails();

  const fromAddress = from.includes("<")
    ? from.slice(from.indexOf("<") + 1, from.indexOf(">")).trim()
    : from.trim();
  const fromLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromAddress);
  const adminRecipientsValid =
    recipients.length > 0 && recipients.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const resendApiKeyConfigured = Boolean(apiKey);

  return {
    resendApiKeyConfigured,
    from,
    fromLooksValid,
    adminRecipients: recipients,
    adminRecipientsValid,
    envVars: {
      RESEND_API_KEY: resendApiKeyConfigured,
      NEWSLETTER_FROM_EMAIL: Boolean(process.env.NEWSLETTER_FROM_EMAIL?.trim()),
      ADMIN_NOTIFICATION_EMAILS: Boolean(process.env.ADMIN_NOTIFICATION_EMAILS?.trim()),
    },
    configured: validation.ok,
    message: validation.message,
  };
}

async function getAuthenticatedAdminUserId(
  request: Request,
): Promise<{ ok: true; userId: string } | { ok: false; error: string; status: number }> {
  try {
    const publicEnv = validateSupabasePublicEnv();
    if (!publicEnv.ok) {
      return { ok: false, error: publicEnv.message, status: 500 };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL?.trim() ?? process.env.VITE_SUPABASE_URL?.trim();
    const SUPABASE_PUBLISHABLE_KEY =
      process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ??
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      return { ok: false, error: publicEnv.message, status: 500 };
    }
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        ok: false,
        error: "Unauthorized: sign in as an admin to use this endpoint.",
        status: 401,
      };
    }
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return { ok: false, error: "Unauthorized: missing access token.", status: 401 };

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { ok: false, error: "Unauthorized: invalid session.", status: 401 };
    }
    return { ok: true, userId: data.user.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not verify admin session.",
      status: 500,
    };
  }
}

async function assertNewsletterAccess(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: adminRow, error: adminError }, { data: roleRows, error: rolesError }] =
      await Promise.all([
        supabaseAdmin.from("admins").select("role").eq("user_id", userId).maybeSingle(),
        supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
      ]);
    if (adminError || rolesError) {
      return {
        ok: false,
        error: adminError?.message ?? rolesError?.message ?? "Could not verify admin role.",
        status: 500,
      };
    }

    const roles = [adminRow?.role, ...(roleRows ?? []).map((row) => row.role)].filter(
      (role): role is AppRole => Boolean(role),
    );

    if (!getPermissions(roles).canManageNewsletter) {
      return {
        ok: false,
        error: "Forbidden: newsletter management requires an admin role.",
        status: 403,
      };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Missing Supabase")) {
      return { ok: false, error: "Supabase server configuration is missing.", status: 500 };
    }
    return { ok: false, error: message, status: 500 };
  }
}

export async function runNewsletterTest(
  triggeredByEmail?: string | null,
): Promise<NewsletterTestResult> {
  try {
    const apiKey = getResendApiKey();
    if (!apiKey) {
      return {
        ok: false,
        error: "RESEND_API_KEY is not configured on the server.",
        details: "Set RESEND_API_KEY on Vercel (server env only, no VITE_ prefix), then redeploy.",
      };
    }

    const from = getFromAddress();
    const recipients = getAdminNotifyEmails();
    if (recipients.length === 0) {
      return {
        ok: false,
        error: "No admin notification recipients configured.",
        details: "Set ADMIN_NOTIFICATION_EMAILS (comma-separated) or rely on the defaults.",
      };
    }

    const when = new Date().toISOString();
    const subject = "[TEST] YOHRIAE newsletter notification";
    const text = [
      "This is a test notification from the YOHRIAE admin dashboard.",
      "",
      `Triggered at: ${when}`,
      `Triggered by: ${triggeredByEmail ?? "unknown admin"}`,
      "",
      "If you received this message, Resend + NEWSLETTER_FROM_EMAIL are working.",
      "Real subscriber notifications will arrive at this address.",
    ].join("\n");
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a2540;max-width:560px">
        <h2 style="color:#0a2540;margin:0 0 12px">YOHRIAE newsletter test</h2>
        <p>This is a test notification from the YOHRIAE admin dashboard.</p>
        <p><strong>Triggered at:</strong> ${when}</p>
        <p><strong>Triggered by:</strong> ${triggeredByEmail ?? "unknown admin"}</p>
        <p style="margin-top:16px;color:#666;font-size:13px">
          If you received this message, Resend + NEWSLETTER_FROM_EMAIL are working.
          Real subscriber notifications will arrive at this address.
        </p>
      </div>
    `;

    const results = await Promise.all(
      recipients.map(async (email): Promise<NewsletterRecipient> => {
        const res = await sendResendEmail({
          from,
          to: email,
          subject,
          html,
          text,
          label: `test (${email})`,
        });
        return { email, ok: res.ok, error: res.error, messageId: res.messageId };
      }),
    );

    const failed = results.filter((r) => !r.ok);
    if (failed.length === 0) {
      return { ok: true, sentAt: when, from, recipients: results };
    }

    return {
      ok: false,
      error:
        failed.length === results.length
          ? "All test emails failed to send."
          : `${failed.length} of ${results.length} test emails failed.`,
      details: failed.map((r) => `${r.email}: ${r.error ?? "unknown error"}`).join(" | "),
      recipients: results,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[newsletter-test] unhandled error", err);
    return { ok: false, error: "Newsletter test endpoint failed.", details: message };
  }
}

export async function respondToNewsletterStatusRequest(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return jsonErrorResponse("Method not allowed.", 405);
  }

  const auth = await getAuthenticatedAdminUserId(request);
  if (!auth.ok) {
    return jsonErrorResponse(auth.error, auth.status);
  }

  const access = await assertNewsletterAccess(auth.userId);
  if (!access.ok) {
    return jsonErrorResponse(access.error, access.status);
  }

  try {
    const status = describeNewsletterStatus();
    return jsonResponse({ ok: true, status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonErrorResponse("Newsletter status endpoint failed.", 500, message);
  }
}

export async function respondToNewsletterTestRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonErrorResponse("Method not allowed.", 405);
  }

  const auth = await getAuthenticatedAdminUserId(request);
  if (!auth.ok) {
    return jsonErrorResponse(auth.error, auth.status);
  }

  const access = await assertNewsletterAccess(auth.userId);
  if (!access.ok) {
    return jsonErrorResponse(access.error, access.status);
  }

  let triggeredByEmail: string | null = null;
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL?.trim() ?? process.env.VITE_SUPABASE_URL?.trim();
    const SUPABASE_PUBLISHABLE_KEY =
      process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ??
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
    if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
      const token = request.headers.get("authorization")?.replace("Bearer ", "").trim() ?? "";
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await supabase.auth.getUser(token);
      triggeredByEmail = data.user?.email ?? null;
    }
  } catch {
    triggeredByEmail = null;
  }

  const result = await runNewsletterTest(triggeredByEmail);
  const status = result.ok ? 200 : 500;
  return jsonResponse(result as unknown as Record<string, unknown>, status);
}
