import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";

export function Newsletter({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [doneMessage, setDoneMessage] = useState("You have subscribed successfully.");
  const dark = variant === "dark";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;

    setStatus("sending");
    setDoneMessage("You have subscribed successfully.");

    try {
      const result = await subscribeToNewsletter({ data: { email: value } });

      if (result.status === "duplicate") {
        setStatus("done");
        setDoneMessage("You are already subscribed.");
        toast.success("You are already subscribed.");
        return;
      }

      if (result.status === "error") {
        console.error("[newsletter] Client received error:", result.message);
        setStatus("error");
        toast.error("Could not subscribe right now. Please try again.");
        return;
      }

      setStatus("done");
      setEmail("");

      if (result.notification === "send_failed") {
        setDoneMessage("Subscription saved, but email notification failed.");
        toast.warning("Subscription saved, but email notification failed.");
      } else {
        toast.success("You have subscribed successfully.");
      }
    } catch (err) {
      console.error("[newsletter] Client request failed:", err);
      setStatus("error");
      toast.error("Could not subscribe right now. Please try again.");
    }
  }

  return (
    <div className={dark ? "footer-newsletter" : "card-ngo p-6"}>
      <div className="flex items-start gap-3">
        <div
          className={`icon-box h-9 w-9 shrink-0 ${dark ? "border border-white/15 bg-white/10 text-[var(--brand-cyan)]" : ""}`}
        >
          <Mail className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-base font-semibold ${dark ? "text-white" : "text-foreground"}`}>
            Stay Connected
          </h3>
          <p
            className={`mt-1 text-sm leading-relaxed ${
              dark ? "text-white/70" : "text-muted-foreground"
            }`}
          >
            Updates on programs, advocacy, and community initiatives.
          </p>
          {status === "done" ? (
            <p
              className={`mt-3 text-sm font-medium ${dark ? "text-[var(--brand-cyan)]" : "text-primary"}`}
            >
              {doneMessage}
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              aria-label="Newsletter signup"
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                aria-describedby="newsletter-privacy"
                className={`min-w-0 flex-1 rounded-md border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                  dark
                    ? "border-white/20 bg-white/8 text-white placeholder:text-white/40 focus:border-[var(--brand-cyan)] focus:ring-[color-mix(in_srgb,var(--brand-cyan)_25%,transparent)]"
                    : "border-input bg-background focus:border-primary focus:ring-primary/20"
                }`}
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className={`w-full shrink-0 rounded-md px-4 py-2.5 text-sm font-semibold disabled:opacity-60 sm:w-auto ${
                  dark ? "bg-white text-primary hover:bg-white/95" : "btn-primary"
                }`}
              >
                {status === "sending" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-2 text-sm text-destructive">
              Subscription failed. Please try again later.
            </p>
          )}
          <p
            id="newsletter-privacy"
            className={`mt-3 text-xs ${dark ? "text-white/45" : "text-muted-foreground"}`}
          >
            Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
