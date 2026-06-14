import { Link } from "@tanstack/react-router";
import {
  AtSign,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Twitter,
} from "lucide-react";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";
import { FOOTER_LINKS, SITE } from "@/lib/site-config";
import { toTelHref, toWhatsAppHref, useSiteSettings } from "@/lib/site-settings";

export function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className="mt-auto border-t border-border bg-[#0a2540] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo imageClassName="h-14 brightness-0 invert sm:h-16" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
              {settings.longName}. {settings.footerText}
            </p>
            <p className="mt-3 text-xs text-white/55">{SITE.registration}</p>
            <p className="mt-1 text-xs text-white/55">Est. {SITE.founded}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <FooterColumn title="About" links={FOOTER_LINKS.about} />
            <FooterColumn title="Programs" links={FOOTER_LINKS.programs} />
            <FooterColumn title="Resources" links={FOOTER_LINKS.resources} />
            <FooterColumn title="Get Involved" links={FOOTER_LINKS.getInvolved} />
          </div>
        </div>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <span>
                  {settings.address}
                  <br />
                  {settings.location}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <a href={`mailto:${settings.secondaryEmail}`} className="hover:text-white">
                  {settings.secondaryEmail}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <a href={toTelHref(settings.phone)} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <a href={toWhatsAppHref(settings.whatsapp)} className="hover:text-white">
                  {settings.whatsapp}
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-2">
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
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <Newsletter variant="dark" />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>{SITE.longName}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { to: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={`${title}-${l.label}`}>
            <Link to={l.to} className="text-white/70 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
