import { Link, useLocation } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Menu, Music2, Twitter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/lib/site-config";
import { analyticsEvents } from "@/lib/analytics";
import { useSiteSettings } from "@/lib/site-settings";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const settings = useSiteSettings();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [open]);

  const socialLinks = [
    { href: settings.social.instagram, label: "Instagram", Icon: Instagram },
    { href: settings.social.facebook, label: "Facebook", Icon: Facebook },
    { href: settings.social.twitter, label: "X", Icon: Twitter },
    { href: settings.social.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: settings.social.tiktok, label: "TikTok", Icon: Music2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6 lg:h-[78px] lg:px-8">
        <Logo />

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
                    : "text-foreground/75 hover:bg-surface hover:text-primary"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/partner"
            onClick={() => analyticsEvents.partnerClick("header")}
            className="btn-outline hidden px-4 py-2 text-sm lg:inline-flex"
          >
            Partner With Us
          </Link>
          <Link
            to="/donate"
            onClick={() => analyticsEvents.donateClick("header")}
            className="btn-primary hidden px-4 py-2 text-sm lg:inline-flex"
          >
            Donate
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-[64px] z-40 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-foreground/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id="mobile-menu"
          className={`absolute inset-x-0 top-0 origin-top bg-background shadow-soft transition-transform duration-200 ease-out ${
            open ? "translate-y-0" : "-translate-y-2 opacity-0"
          }`}
        >
          <div className="max-h-[calc(100vh-64px)] overflow-y-auto px-4 pb-6 pt-3 sm:px-6">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((l) => {
                const active = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between border-b border-border px-1 py-3.5 text-base font-medium transition-colors ${
                      active ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                  >
                    <span>{l.label}</span>
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-[var(--brand-magenta)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 flex flex-col gap-2.5">
              <Link
                to="/donate"
                onClick={() => {
                  analyticsEvents.donateClick("mobile_header");
                  setOpen(false);
                }}
                className="btn-primary w-full py-3 text-sm"
              >
                Donate
              </Link>
              <Link
                to="/partner"
                onClick={() => {
                  analyticsEvents.partnerClick("mobile_header");
                  setOpen(false);
                }}
                className="btn-outline w-full py-3 text-sm"
              >
                Partner With Us
              </Link>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Follow YOHRIAE
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
