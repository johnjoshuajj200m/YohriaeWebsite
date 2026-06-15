import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendNewsletterNotification } from "./newsletter.server";

export type NewsletterSubscribeResult =
  | { status: "success"; notification: "sent" | "not_configured" | "send_failed" }
  | { status: "duplicate" }
  | { status: "error"; message: string };

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().trim().email().max(320),
    }),
  )
  .handler(async ({ data }): Promise<NewsletterSubscribeResult> => {
    const email = data.email.trim().toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email })
      .select("email, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { status: "duplicate" };
      }
      return {
        status: "error",
        message: error.message || "Could not save subscription.",
      };
    }

    const notification = await sendNewsletterNotification(email, row.created_at);

    if (!notification.sent && notification.reason === "not_configured") {
      console.warn(
        "[newsletter] Email notifications disabled. Configure on Vercel: RESEND_API_KEY, NEWSLETTER_FROM_EMAIL (verified sender).",
      );
    }

    return {
      status: "success",
      notification: notification.sent
        ? "sent"
        : notification.reason === "not_configured"
          ? "not_configured"
          : "send_failed",
    };
  });
