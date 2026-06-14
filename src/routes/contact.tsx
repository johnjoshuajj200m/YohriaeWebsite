import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Music2, Phone, Send, CheckCircle2, Twitter } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyticsEvents } from "@/lib/analytics";
import { toTelHref, toWhatsAppHref, useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact YOHRIAE" },
      {
        name: "description",
        content:
          "Get in touch with YOHRIAE — partnerships, media, volunteering, and general inquiries.",
      },
      { property: "og:title", content: "Contact YOHRIAE" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
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
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's start a conversation"
        description="Partnership inquiries, media requests, volunteer interest or general questions — we'd love to hear from you."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="brand-card rounded-lg border border-border bg-card p-8"
          >
            {state === "sent" ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-2xl font-bold">Message sent</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Thank you for reaching out. A member of our team will get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="mt-6 rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold">Send a message</h2>
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
                      rows={6}
                      required
                      className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  {errors.message && (
                    <p className="mt-1 text-sm text-destructive">{errors.message}</p>
                  )}
                </div>
                {errorMsg && <p className="mt-3 text-sm text-destructive">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="btn-primary mt-6 disabled:opacity-60"
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
              { Icon: Mail, label: "Primary Email", value: settings.email, href: `mailto:${settings.email}` },
              { Icon: Mail, label: "Secondary Email", value: settings.secondaryEmail, href: `mailto:${settings.secondaryEmail}` },
              { Icon: Phone, label: "Office Phone", value: settings.phone, href: toTelHref(settings.phone) },
              { Icon: MessageCircle, label: "WhatsApp", value: settings.whatsapp, href: toWhatsAppHref(settings.whatsapp) },
            ].map(({ Icon, label, value, href }) => (
              <div
                key={label}
                className="brand-card flex items-start gap-4 rounded-lg border border-border bg-card p-5"
              >
                <div className="icon-box icon-box-cyan h-10 w-10 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                  {href ? (
                    <a href={href} className="font-semibold text-foreground hover:text-primary">
                      {value}
                    </a>
                  ) : (
                    <p className="font-semibold text-foreground">{value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground">
              For safeguarding reasons we do not publish individual staff contacts. Please reach our
              team through the organizational channels above.
            </div>
            <div className="brand-card rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Quick Actions
              </h2>
              <div className="mt-4 grid gap-2">
                <a
                  href={toTelHref(settings.phone)}
                  onClick={() => analyticsEvents.contactChannel("phone", "contact_quick_actions")}
                  className="btn-primary justify-center"
                >
                  <Phone className="h-4 w-4" /> Call Now
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  onClick={() => analyticsEvents.contactChannel("email", "contact_quick_actions")}
                  className="btn-outline justify-center"
                >
                  <Mail className="h-4 w-4" /> Send Email
                </a>
                <a
                  href={toWhatsAppHref(settings.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => analyticsEvents.contactChannel("whatsapp", "contact_quick_actions")}
                  className="btn-outline justify-center"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Chat
                </a>
              </div>
            </div>
            <div className="brand-card rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
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
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
