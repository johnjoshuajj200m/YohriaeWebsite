import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, Mail, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { toWhatsAppHref, useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer With YOHRIAE" },
      {
        name: "description",
        content:
          "Volunteer with YOHRIAE to support youth health, human rights, community outreach, and advocacy programs.",
      },
      { property: "og:title", content: "Volunteer With YOHRIAE" },
      { property: "og:url", content: "/volunteer" },
    ],
    links: [{ rel: "canonical", href: "/volunteer" }],
  }),
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
          {[
            "Community outreach support",
            "Youth education sessions",
            "Digital communications",
            "Program documentation",
            "Event coordination",
            "Peer advocacy",
          ].map((item) => (
            <div key={item} className="brand-card rounded-lg border border-border bg-background p-6">
              <HeartHandshake className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{item}</h2>
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
            <a href={toWhatsAppHref(settings.whatsapp)} target="_blank" rel="noreferrer" className="btn-outline">
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
