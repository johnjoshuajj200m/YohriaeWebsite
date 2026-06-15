import { Link } from "@tanstack/react-router";
import { Handshake, Mail, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { SITE } from "@/lib/site-config";
import { analyticsEvents } from "@/lib/analytics";
import { toTelHref, toWhatsAppHref, useSiteSettings } from "@/lib/site-settings";
import { buildPageHead } from "@/lib/seo";
import { buildPartnerPageSchema } from "@/lib/schema";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/partner")({
  component: Partner,
});

function Partner() {
  const settings = useSiteSettings();

  return (
    <>
      <PageHero
        eyebrow="Partner With Us"
        title="Collaborate with YOHRIAE to scale accountable community impact"
        description="We work with donors, NGOs, government stakeholders, youth networks, health actors, and community leaders."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card-ngo p-8">
            <div className="icon-box h-12 w-12">
              <Handshake className="h-6 w-6" />
            </div>
            <SectionHeader
              eyebrow="Partnership areas"
              title="How organizations work with us"
              description="Mission-aligned partnerships that strengthen health, rights, dignity, and opportunity for young people and vulnerable communities."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Program funding",
                "Technical support",
                "Community outreach",
                "Health education",
                "Human rights advocacy",
                "Youth leadership",
                "Research and documentation",
                "Referral pathways",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-sm border border-border bg-surface px-4 py-3 text-sm font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {SITE.name} welcomes partnerships that combine local trust with evidence, documentation,
              and partner-ready reporting.
            </p>
          </div>

          <aside className="card-ngo p-6">
            <h2 className="text-lg font-bold">Start a partnership conversation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Reach the YOHRIAE team through official channels.
            </p>
            <div className="mt-5 grid gap-2">
              <a
                href={`mailto:${settings.email}`}
                onClick={() => {
                  analyticsEvents.partnerClick("partner_page");
                  analyticsEvents.contactChannel("email", "partner_page");
                }}
                className="btn-primary justify-center"
              >
                <Mail className="h-4 w-4" /> Send Email
              </a>
              <a
                href={toTelHref(settings.phone)}
                onClick={() => analyticsEvents.contactChannel("phone", "partner_page")}
                className="btn-outline justify-center"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <a
                href={toWhatsAppHref(settings.whatsapp)}
                target="_blank"
                rel="noreferrer"
                onClick={() => analyticsEvents.contactChannel("whatsapp", "partner_page")}
                className="btn-outline justify-center"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Chat
              </a>
              <Link
                to="/contact"
                hash="contact-form"
                onClick={() => analyticsEvents.partnerClick("partner_use_contact_form")}
                className="btn-outline justify-center"
              >
                Use Contact Form
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

