import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGIN_URL = "https://yohriae.com/auth";
const ASSIGNABLE_ROLES = ["super_admin", "admin", "editor", "viewer"] as const;
type AppRole = (typeof ASSIGNABLE_ROLES)[number];

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateTempPassword(length = 16): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function roleLabel(role: string) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "editor":
      return "Editor";
    case "viewer":
      return "Viewer";
    default:
      return role;
  }
}

async function sendInviteEmail(opts: {
  to: string;
  role: string;
  tempPassword: string;
  loginUrl: string;
}): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return false;

  const from = Deno.env.get("INVITE_FROM_EMAIL") ?? "YOHRIAE Admin <noreply@yohriae.com>";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a2540;max-width:560px">
      <h2 style="color:#0a2540">Your YOHRIAE admin account</h2>
      <p>You have been invited to the YOHRIAE admin dashboard.</p>
      <table style="margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Login URL</td><td><a href="${opts.loginUrl}">${opts.loginUrl}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Email</td><td>${opts.to}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Temporary password</td><td><code>${opts.tempPassword}</code></td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Role</td><td>${roleLabel(opts.role)}</td></tr>
      </table>
      <p><strong>Please change your password after your first login.</strong></p>
      <p style="color:#666;font-size:13px">If you did not expect this invitation, contact the YOHRIAE team.</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: "Your YOHRIAE admin account",
      html,
    }),
  });

  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await userClient.auth.getUser();

  if (callerError || !caller) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerAdmin } = await adminClient
    .from("admins")
    .select("role")
    .eq("user_id", caller.id)
    .maybeSingle();

  if (callerAdmin?.role !== "super_admin") {
    return jsonResponse({ error: "Only super admins can invite users" }, 403);
  }

  let body: { email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  const role = body.role as AppRole | undefined;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return jsonResponse({ error: "Valid email is required" }, 400);
  }

  if (!role || !ASSIGNABLE_ROLES.includes(role)) {
    return jsonResponse({ error: "Valid role is required" }, 400);
  }

  const { data: existingAdmin } = await adminClient
    .from("admins")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (existingAdmin) {
    return jsonResponse({ error: "A user with this email already exists" }, 409);
  }

  const tempPassword = generateTempPassword();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { invited_by: caller.id, must_change_password: true },
  });

  if (createError || !created.user) {
    return jsonResponse({ error: createError?.message ?? "Could not create auth user" }, 500);
  }

  const newUserId = created.user.id;

  const { error: adminsError } = await adminClient.from("admins").upsert(
    {
      user_id: newUserId,
      email,
      role,
    },
    { onConflict: "user_id" },
  );

  if (adminsError) {
    await adminClient.auth.admin.deleteUser(newUserId);
    return jsonResponse({ error: adminsError.message }, 500);
  }

  await adminClient
    .from("user_roles")
    .upsert({ user_id: newUserId, role }, { onConflict: "user_id,role" });

  await adminClient.from("profiles").upsert(
    {
      id: newUserId,
      email,
      display_name: email,
      is_active: true,
    },
    { onConflict: "id" },
  );

  const emailSent = await sendInviteEmail({
    to: email,
    role,
    tempPassword,
    loginUrl: LOGIN_URL,
  });

  const status = emailSent ? "email_sent" : "provisioned";

  const { data: inviteRow, error: inviteError } = await adminClient
    .from("admin_invites")
    .upsert(
      {
        email,
        role,
        invited_by: caller.id,
        user_id: newUserId,
        accepted_at: null,
        status,
        email_sent: emailSent,
        temp_password: emailSent ? null : tempPassword,
        login_url: LOGIN_URL,
      },
      { onConflict: "email" },
    )
    .select("*")
    .single();

  if (inviteError) {
    return jsonResponse({ error: inviteError.message }, 500);
  }

  return jsonResponse({
    success: true,
    message: emailSent
      ? "Admin account created and invitation email sent."
      : "Admin account created. Copy the temporary password and send it manually.",
    email,
    role,
    loginUrl: LOGIN_URL,
    emailSent,
    tempPassword: emailSent ? null : tempPassword,
    invite: inviteRow,
  });
});
