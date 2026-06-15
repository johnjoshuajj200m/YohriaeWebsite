import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { saveNewsletterSubscriber } from "./newsletter-subscribe.server";
import { sendNewsletterEmails } from "./newsletter.server";

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
    console.info("[newsletter] Subscribe request received for:", email);

    try {
      const saved = await saveNewsletterSubscriber(email);

      if (!saved.ok) {
        if (saved.duplicate) {
          console.info("[newsletter] Duplicate subscription:", email);
          return { status: "duplicate" };
        }
        console.error("[newsletter] Save failed:", saved.message, saved.code ?? "");
        return {
          status: "error",
          message: saved.message || "Could not save subscription.",
        };
      }

      const emails = await sendNewsletterEmails(saved.email, saved.createdAt);

      if (!emails.sent && emails.reason === "not_configured") {
        console.warn(
          "[newsletter] Saved subscriber but email is not configured. Set RESEND_API_KEY on Vercel.",
        );
      } else if (!emails.sent && emails.reason === "send_failed") {
        console.error("[newsletter] Saved subscriber but email failed:", emails.errors.join(" | "));
      }

      return {
        status: "success",
        notification: emails.sent
          ? "sent"
          : emails.reason === "not_configured"
            ? "not_configured"
            : "send_failed",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[newsletter] Unexpected handler error:", message, err);
      return {
        status: "error",
        message,
      };
    }
  });
