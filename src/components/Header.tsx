import { Link, useLocation } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Menu, Music2, Twitter, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/lib/site-config";
import { analyticsEvents } from "@/lib/analytics";
import { useSiteSettings } from "@/lib/site-settings";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const settings = useSiteSettings();
  const socialLinks = [
    { href: settings.social.instagram, label: "Instagram", Icon: Instagram },
    { href: settings.social.facebook, label: "Facebook", Icon: Facebook },
    { href: settings.social.twitter, label: "X", Icon: Twitter },
    { href: settings.social.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: settings.social.tiktok, label: "TikTok", Icon: Music2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:min-h-[5rem] sm:gap-6 sm:px-6 lg:min-h-[5.25rem] lg:px-8">
        <Logo className="mr-1 sm:mr-2" />
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {NAV_LINKS.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "active text-primary"
                    : "text-foreground/70 hover:bg-surface hover:text-primary"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 xl:flex" aria-label="Social media">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <Link
            to="/partner"
            onClick={() => analyticsEvents.partnerClick("header")}
            className="btn-outline hidden px-4 py-2 text-sm sm:inline-flex"
          >
            Partner With Us
          </Link>
          <Link
            to="/donate"
            onClick={() => analyticsEvents.donateClick("header")}
            className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex"
          >
            Donate
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-0.5 px-4 py-4" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-surface"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                to="/partner"
                onClick={() => {
                  analyticsEvents.partnerClick("mobile_header");
                  setOpen(false);
                }}
                className="btn-outline w-full"
              >
                Partner With Us
              </Link>
              <Link
                to="/donate"
                onClick={() => {
                  analyticsEvents.donateClick("mobile_header");
                  setOpen(false);
                }}
                className="btn-primary w-full"
              >
                Donate
              </Link>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Social Media
              </p>
              <div className="mt-2 flex flex-wrap gap-2 px-3">
                {socialLinks.map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
