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
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className="footer-dark mt-auto bg-[#0a2540]"
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-[var(--brand-magenta)] via-[var(--brand-cyan)] to-[var(--brand-gold)]" />
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        {/* Brand + link columns */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_2fr] lg:gap-10">
          <div>
            <Logo imageClassName="h-[4.25rem] w-auto brightness-0 invert sm:h-[4.75rem]" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
              {settings.longName}. {settings.footerText}
            </p>
            <p className="footer-heading mt-4 !text-[0.625rem] !tracking-[0.14em]">
              {SITE.registration}
            </p>
            <p className="mt-1 text-xs text-white/55">Est. {SITE.founded}</p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-4 md:gap-x-6"
          >
            <FooterColumn title="About" links={FOOTER_LINKS.about} />
            <FooterColumn title="Programs" links={FOOTER_LINKS.programs} />
            <FooterColumn title="Resources" links={FOOTER_LINKS.resources} />
            <FooterColumn title="Get Involved" links={FOOTER_LINKS.getInvolved} />
          </nav>
        </div>

        {/* Contact + newsletter */}
        <div className="mt-8 grid gap-8 border-t border-white/10 pt-8 lg:mt-10 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:pt-10">
          <div>
            <h3 className="footer-heading">Contact</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-cyan)]" />
                <span className="text-white/80">
                  {settings.address}
                  <br />
                  {settings.location}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-cyan)]" />
                <a href={`mailto:${settings.email}`} className="footer-link break-all">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-cyan)]" />
                <a href={`mailto:${settings.secondaryEmail}`} className="footer-link break-all">
                  {settings.secondaryEmail}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-cyan)]" />
                <a href={toTelHref(settings.phone)} className="footer-link">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-cyan)]" />
                <a
                  href={toWhatsAppHref(settings.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-link"
                >
                  {settings.whatsapp}
                </a>
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white/75 transition-colors hover:border-[var(--brand-cyan)] hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <Newsletter variant="dark" />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
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
      <h3 className="footer-heading">{title}</h3>
      <ul className="mt-2.5 space-y-2 text-sm">
        {links.map((l) => (
          <li key={`${title}-${l.label}`}>
            <Link to={l.to} className="footer-link">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
