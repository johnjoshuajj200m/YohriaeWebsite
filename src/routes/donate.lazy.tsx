import { Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Handshake, Heart } from "lucide-react";
import { useState } from "react";
import { analyticsEvents } from "@/lib/analytics";
import { buildPageHead } from "@/lib/seo";
import { buildDonatePageSchema } from "@/lib/schema";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/donate")({
  component: Donate,
});

const PRESETS = [25, 50, 100, 250];

function Donate() {
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState<string>("");
  const [recurring, setRecurring] = useState(false);

  const finalAmount = custom ? Number(custom) : amount;

  return (
    <>
      <PageHero
        eyebrow="Donate"
        title="Your support helps us educate, advocate, and empower young people"
        description="Every contribution directly funds programs that change lives across Northern Nigeria."
        compact
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="brand-card rounded-lg border border-border bg-background p-8">
            <h2 className="text-xl font-bold">Make a donation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose an amount and frequency. You'll be guided to a secure checkout.
            </p>

            <div className="mt-6 flex gap-1 rounded-md bg-surface p-1">
              <button
                type="button"
                onClick={() => setRecurring(false)}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  !recurring ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => setRecurring(true)}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  recurring ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setAmount(p);
                    setCustom("");
                  }}
                  className={`rounded-md border py-3 text-sm font-semibold transition-colors ${
                    !custom && amount === p
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Custom amount
              </span>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Other amount"
                  className="w-full rounded-md border border-input bg-background py-3 pl-8 pr-4 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={() => {
                analyticsEvents.donateClick("donate_form", finalAmount || 0, recurring);
                alert(
                  "Thank you for choosing to support YOHRIAE. Please contact the team to complete your donation pledge of $" +
                    finalAmount +
                    (recurring ? " / month" : ""),
                );
              }}
              className="btn-primary mt-6 w-full"
            >
              <Heart className="h-4 w-4" />
              Donate ${finalAmount || 0}
              {recurring ? " / month" : ""}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              YOHRIAE will follow up through official contact channels to complete donation support.
            </p>
          </div>

          <aside className="space-y-5">
            <div className="brand-card rounded-lg border border-border bg-surface p-6">
              <h3 className="text-base font-semibold">Your impact</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">$25</strong> — supports a peer education
                  session
                </li>
                <li>
                  <strong className="text-foreground">$50</strong> — funds a community dialogue
                </li>
                <li>
                  <strong className="text-foreground">$100</strong> — sponsors a leadership training
                  day
                </li>
                <li>
                  <strong className="text-foreground">$250</strong> — provides survivor support
                  resources
                </li>
              </ul>
            </div>
            <div className="brand-card rounded-lg border border-border bg-background p-6">
              <div className="icon-box icon-box-gold h-10 w-10">
                <Handshake className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold">Other ways to give</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Interested in partnership, grants, or in-kind support?
              </p>
              <Link
                to="/partner"
                onClick={() => analyticsEvents.partnerClick("donate_page")}
                className="btn-outline mt-4 w-full text-sm"
              >
                Become a Partner
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
