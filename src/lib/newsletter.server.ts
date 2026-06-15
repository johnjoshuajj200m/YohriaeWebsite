const NOTIFY_EMAILS = ["yohriae2019@gmail.com", "yohriaenigeria@gmail.com"] as const;

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

export type NewsletterNotificationResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "send_failed" };

export async function sendNewsletterNotification(
  email: string,
  createdAt: string,
): Promise<NewsletterNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, reason: "not_configured" };
  }

  const from =
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ??
    process.env.NOTIFICATION_FROM_EMAIL?.trim() ??
    "YOHRIAE <noreply@yohriae.com>";

  const when = formatSubscriptionTime(createdAt);
  const text = [
    "A new user subscribed to the YOHRIAE website newsletter.",
    "",
    `Subscriber email: ${email}`,
    `Date/time: ${when}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0a2540;max-width:560px">
      <h2 style="color:#0a2540;margin:0 0 12px">New YOHRIAE Newsletter Subscriber</h2>
      <p>A new user subscribed to the YOHRIAE website newsletter.</p>
      <p><strong>Subscriber email:</strong> ${email}</p>
      <p><strong>Date/time:</strong> ${when}</p>
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
      to: [...NOTIFY_EMAILS],
      subject: "New YOHRIAE Newsletter Subscriber",
      html,
      text,
    }),
  });

  return res.ok ? { sent: true } : { sent: false, reason: "send_failed" };
}

export const NEWSLETTER_NOTIFY_SETUP = [
  "RESEND_API_KEY — your Resend API key",
  "NEWSLETTER_FROM_EMAIL — verified sender, e.g. YOHRIAE <noreply@yohriae.com>",
] as const;
