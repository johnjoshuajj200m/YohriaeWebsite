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
    <header
      role="banner"
      className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6 lg:h-[84px] lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
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
            className="relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-md border border-border text-foreground transition-colors hover:border-[var(--brand-magenta)] hover:text-[var(--brand-magenta)] lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu
              className={`absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
            />
            <X
              className={`absolute h-5 w-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu-overlay"
        className={`fixed inset-0 top-[72px] z-40 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-foreground/45 transition-opacity duration-300 ease-out ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={`absolute inset-x-0 top-0 origin-top bg-background shadow-[0_24px_48px_-12px_rgba(15,76,129,0.25)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          {/* Magenta → cyan accent strip */}
          <div className="h-[3px] w-full bg-gradient-to-r from-[var(--brand-magenta)] via-[var(--brand-cyan)] to-[var(--brand-gold)]" />
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto px-5 pb-7 pt-4 sm:px-6">
            <nav className="flex flex-col" aria-label="Mobile primary">
              {NAV_LINKS.map((l, idx) => {
                const active = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    style={open ? { animationDelay: `${40 + idx * 30}ms` } : undefined}
                    className={`group flex items-center justify-between border-b border-border/70 py-4 text-[1.0625rem] font-medium tracking-tight transition-colors ${
                      open ? "anim-fade-up-fast" : ""
                    } ${
                      active
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`block h-[2px] w-5 rounded-full transition-all duration-300 ${
                          active
                            ? "bg-[var(--brand-magenta)] w-7"
                            : "bg-border group-hover:bg-[var(--brand-cyan)]"
                        }`}
                      />
                      {l.label}
                    </span>
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-[var(--brand-magenta)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 grid gap-2.5">
              <Link
                to="/donate"
                onClick={() => {
                  analyticsEvents.donateClick("mobile_header");
                  setOpen(false);
                }}
                className="btn-primary w-full py-3.5 text-[0.9375rem]"
              >
                Donate
              </Link>
              <Link
                to="/partner"
                onClick={() => {
                  analyticsEvents.partnerClick("mobile_header");
                  setOpen(false);
                }}
                className="btn-outline w-full py-3.5 text-[0.9375rem]"
              >
                Partner With Us
              </Link>
            </div>

            <div className="mt-7 border-t border-border pt-5">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-[var(--brand-magenta)]">
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
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-[var(--brand-cyan)] hover:text-primary"
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
