import { Link } from "@tanstack/react-router";
import { HeartHandshake, Mail, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { toWhatsAppHref, useSiteSettings } from "@/lib/site-settings";
import { buildPageHead } from "@/lib/seo";
import { buildVolunteerPageSchema } from "@/lib/schema";

const VOLUNTEER_OPPORTUNITIES = [
  { name: "Community outreach support" },
  { name: "Youth education sessions" },
  { name: "Digital communications" },
  { name: "Program documentation" },
  { name: "Event coordination" },
  { name: "Peer advocacy" },
] as const;
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/volunteer")({
  component: Volunteer,
});

function Volunteer() {
  const settings = useSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Use your time and skills to support community-led change"
        description="YOHRIAE welcomes volunteers who care about health, dignity, rights, youth leadership, and accountable outreach."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {VOLUNTEER_OPPORTUNITIES.map((item) => (
            <div
              key={item.name}
              className="brand-card rounded-lg border border-border bg-background p-6"
            >
              <HeartHandshake className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-center">
          <h2 className="text-xl font-bold">Ready to volunteer?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Contact YOHRIAE with your interest, location, skills, and availability.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`mailto:${settings.email}`} className="btn-primary">
              <Mail className="h-4 w-4" /> Send Email
            </a>
            <a
              href={toWhatsAppHref(settings.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Chat
            </a>
            <Link to="/contact" className="btn-outline">
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
