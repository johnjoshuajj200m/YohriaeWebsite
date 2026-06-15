import { PageHero } from "@/components/PageHero";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Send,
  CheckCircle2,
  Twitter,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyticsEvents } from "@/lib/analytics";
import { toTelHref, toWhatsAppHref, useSiteSettings } from "@/lib/site-settings";
import { buildPageHead } from "@/lib/seo";
import { buildContactPageSchema } from "@/lib/schema";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/contact")({
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Please add a message").max(5000),
});

function Contact() {
  const settings = useSiteSettings();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject") || undefined,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setState("sending");
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject ?? null,
        message: parsed.data.message,
      });
      if (error) {
        setState("error");
        const msg =
          error.message ||
          "Could not send your message. Please email yohriae2019@gmail.com directly.";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      analyticsEvents.contactSubmission();
      toast.success("Message sent. We'll get back to you soon.");
      setState("sent");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setState("error");
      const msg =
        err instanceof Error
          ? err.message
          : "Could not send your message. Please email yohriae2019@gmail.com directly.";
      setErrorMsg(msg);
      toast.error(msg);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's start a conversation"
        description="Partnership inquiries, media requests, volunteer interest or general questions — we'd love to hear from you."
      />
      <section
        id="contact-form"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
      >
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-10">
          <form
            onSubmit={handleSubmit}
            className="card-ngo relative overflow-hidden p-5 sm:p-7 lg:p-8"
          >
            {/* Magenta top accent */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--brand-magenta)] via-[var(--brand-cyan)] to-transparent"
            />
            {state === "sent" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-bold sm:text-2xl">Message sent</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Thank you for reaching out. A member of our team will get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="btn-outline mt-6 px-5 py-2.5 text-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="accent-bar" />
                  <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-[var(--brand-magenta)]">
                    Send a message
                  </p>
                </div>
                <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                  We'd love to hear from you
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Tell us about your inquiry — we usually reply within 2 business days.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Your name" name="name" error={errors.name} />
                  <Field label="Email" name="email" type="email" error={errors.email} />
                </div>
                <Field label="Subject" name="subject" className="mt-4" error={errors.subject} />
                <div className="mt-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">Message</span>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      placeholder="Share a bit of context so we can route your message to the right person."
                      className="contact-input mt-1.5 sm:rows-6"
                    />
                  </label>
                  {errors.message && (
                    <p className="mt-1.5 text-sm text-destructive">{errors.message}</p>
                  )}
                </div>
                {errorMsg && (
                  <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="btn-primary mt-6 w-full py-3 text-sm sm:w-auto sm:px-7 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {state === "sending" ? "Sending…" : "Send message"}
                </button>
              </>
            )}
          </form>

          <aside className="space-y-4">
            {[
              { Icon: MapPin, label: "Office", value: settings.location },
              {
                Icon: Mail,
                label: "Primary Email",
                value: settings.email,
                href: `mailto:${settings.email}`,
              },
              {
                Icon: Mail,
                label: "Secondary Email",
                value: settings.secondaryEmail,
                href: `mailto:${settings.secondaryEmail}`,
              },
              {
                Icon: Phone,
                label: "Office Phone",
                value: settings.phone,
                href: toTelHref(settings.phone),
              },
              {
                Icon: MessageCircle,
                label: "WhatsApp",
                value: settings.whatsapp,
                href: toWhatsAppHref(settings.whatsapp),
              },
            ].map(({ Icon, label, value, href }) => (
              <div key={label} className="card-ngo flex items-start gap-4 p-4 sm:p-5">
                <div className="icon-box icon-box-cyan h-10 w-10 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="break-words font-semibold text-foreground transition-colors hover:text-[var(--brand-magenta)]"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="break-words font-semibold text-foreground">{value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-md border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground sm:p-5">
              For safeguarding reasons we do not publish individual staff contacts. Please reach our
              team through the organizational channels above.
            </div>
            <div className="card-ngo p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-6 rounded-full bg-[var(--brand-magenta)]" />
                <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Quick Actions
                </h2>
              </div>
              <div className="mt-4 grid gap-2">
                <a
                  href={toTelHref(settings.phone)}
                  onClick={() => analyticsEvents.contactChannel("phone", "contact_quick_actions")}
                  className="btn-primary w-full justify-center"
                >
                  <Phone className="h-4 w-4" /> Call Now
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  onClick={() => analyticsEvents.contactChannel("email", "contact_quick_actions")}
                  className="btn-outline w-full justify-center"
                >
                  <Mail className="h-4 w-4" /> Send Email
                </a>
                <a
                  href={toWhatsAppHref(settings.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    analyticsEvents.contactChannel("whatsapp", "contact_quick_actions")
                  }
                  className="btn-outline w-full justify-center"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Chat
                </a>
              </div>
            </div>
            <div className="card-ngo p-4 sm:p-5">
              <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Social Media
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { href: settings.social.instagram, label: "Instagram", Icon: Instagram },
                  { href: settings.social.facebook, label: "Facebook", Icon: Facebook },
                  { href: settings.social.twitter, label: "X", Icon: Twitter },
                  { href: settings.social.linkedin, label: "LinkedIn", Icon: Linkedin },
                  { href: settings.social.tiktok, label: "TikTok", Icon: Music2 },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-[var(--brand-cyan)] hover:text-primary"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  className = "",
  error,
}: {
  label: string;
  name: string;
  type?: string;
  className?: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <label className="block">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <input
          type={type}
          name={name}
          required={name !== "subject"}
          className="contact-input mt-1.5"
        />
      </label>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
