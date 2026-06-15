const DEFAULT_NOTIFY_EMAILS = ["yohriae2019@gmail.com", "yohriaenigeria@gmail.com"] as const;
const DEFAULT_FROM = "YOHRIAE <newsletters@yohriae.com>";

function formatSubscriptionTime(createdAt: string) {
  try {
    return new Date(createdAt).toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return createdAt;
  }
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || undefined;
}

function getFromAddress() {
  return (
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ??
    process.env.NOTIFICATION_FROM_EMAIL?.trim() ??
    DEFAULT_FROM
  );
}

function getAdminNotifyEmails(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS?.trim();
  if (!raw) return [...DEFAULT_NOTIFY_EMAILS];
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

async function sendResendEmail(payload: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  label: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (res.ok) {
      console.info(`[newsletter] Resend ${payload.label} sent`);
      return { ok: true };
    }

    const body = await res.text().catch(() => "");
    const error = `Resend ${payload.label} failed (${res.status}): ${body || res.statusText}`;
    console.error(`[newsletter] ${error}`);
    return { ok: false, error };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[newsletter] Resend ${payload.label} error:`, message);
    return { ok: false, error: message };
  }
}

export type NewsletterEmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "send_failed"; errors: string[] };

export async function sendNewsletterEmails(
  subscriberEmail: string,
  createdAt: string,
): Promise<NewsletterEmailResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    console.warn(
      "[newsletter] RESEND_API_KEY not set — subscription saved without email. Add RESEND_API_KEY on Vercel (server env only).",
    );
    return { sent: false, reason: "not_configured", errors: [] };
  }

  const from = getFromAddress();
  const when = formatSubscriptionTime(createdAt);
  const errors: string[] = [];

  const adminText = [
    "A new user subscribed to the YOHRIAE website newsletter.",
    "",
    `Subscriber email: ${subscriberEmail}`,
    `Date/time: ${when}`,
  ].join("\n");

  const adminHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a2540;max-width:560px">
      <h2 style="color:#0a2540;margin:0 0 12px">New YOHRIAE Newsletter Subscriber</h2>
      <p>A new user subscribed to the YOHRIAE website newsletter.</p>
      <p><strong>Subscriber email:</strong> ${subscriberEmail}</p>
      <p><strong>Date/time:</strong> ${when}</p>
    </div>
  `;

  const welcomeText = [
    "Thank you for subscribing to the YOHRIAE newsletter.",
    "",
    "You will receive updates on our programs, advocacy work, and community initiatives.",
    "",
    "Youth Health and Right Initiative for Advocacy and Empowerment (YOHRIAE)",
    "https://yohriae.com",
  ].join("\n");

  const welcomeHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a2540;max-width:560px">
      <h2 style="color:#0a2540;margin:0 0 12px">Welcome to YOHRIAE</h2>
      <p>Thank you for subscribing to the YOHRIAE newsletter.</p>
      <p>You will receive updates on our programs, advocacy work, and community initiatives.</p>
      <p style="margin-top:24px;color:#666;font-size:13px">
        Youth Health and Right Initiative for Advocacy and Empowerment (YOHRIAE)<br/>
        <a href="https://yohriae.com">yohriae.com</a>
      </p>
    </div>
  `;

  const [adminResult, welcomeResult] = await Promise.all([
    sendResendEmail({
      from,
      to: getAdminNotifyEmails(),
      subject: "New YOHRIAE Newsletter Subscriber",
      html: adminHtml,
      text: adminText,
      label: "admin notification",
    }),
    sendResendEmail({
      from,
      to: subscriberEmail,
      subject: "Welcome to the YOHRIAE Newsletter",
      html: welcomeHtml,
      text: welcomeText,
      label: "welcome email",
    }),
  ]);

  if (!adminResult.ok && adminResult.error) errors.push(adminResult.error);
  if (!welcomeResult.ok && welcomeResult.error) errors.push(welcomeResult.error);

  if (adminResult.ok && welcomeResult.ok) {
    return { sent: true };
  }

  return { sent: false, reason: "send_failed", errors };
}

export const NEWSLETTER_NOTIFY_SETUP = [
  "RESEND_API_KEY — Resend API key (server only, never VITE_ prefix)",
  "NEWSLETTER_FROM_EMAIL — verified sender, e.g. YOHRIAE <newsletters@yohriae.com>",
  "SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_PUBLISHABLE_KEY fallback)",
] as const;
