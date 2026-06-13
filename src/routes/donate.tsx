import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Heart, HandHeart, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — YOHRIAE" },
      { name: "description", content: "Support YOHRIAE's work in health, human rights and youth empowerment across Northern Nigeria. Donate one-time or monthly." },
      { property: "og:title", content: "Donate to YOHRIAE" },
      { property: "og:url", content: "/donate" },
    ],
    links: [{ rel: "canonical", href: "/donate" }],
  }),
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
        title="Your gift becomes someone's opportunity"
        description="Every contribution supports health, rights and empowerment work across Northern Nigeria."
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-8">
            <h2 className="text-2xl font-black">Make a donation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose an amount and frequency. You'll be guided to a secure checkout.
            </p>

            <div className="mt-6 flex gap-2 rounded-full bg-secondary p-1">
              <button
                type="button"
                onClick={() => setRecurring(false)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  !recurring ? "bg-background shadow text-foreground" : "text-muted-foreground"
                }`}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => setRecurring(true)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  recurring ? "bg-background shadow text-foreground" : "text-muted-foreground"
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
                  onClick={() => { setAmount(p); setCustom(""); }}
                  className={`rounded-xl border-2 py-3 text-sm font-bold transition-colors ${
                    !custom && amount === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Custom amount</span>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  min={1}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Other amount"
                  className="w-full rounded-xl border border-input bg-background py-3 pl-8 pr-4 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={() => alert("Stripe checkout will be enabled next. Your selection: $" + finalAmount + (recurring ? " / month" : ""))}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full brand-gradient px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01]"
            >
              <Heart className="h-5 w-5" />
              Donate ${finalAmount || 0}{recurring ? " / month" : ""}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Secure checkout powered by Stripe — coming online shortly.
            </p>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-secondary/40 p-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-lg font-bold">Your impact</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><strong className="text-foreground">$25</strong> — supports a peer education session</li>
                <li><strong className="text-foreground">$50</strong> — funds a community dialogue</li>
                <li><strong className="text-foreground">$100</strong> — sponsors a leadership training day</li>
                <li><strong className="text-foreground">$250</strong> — provides survivor support resources</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <HandHeart className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-lg font-bold">Other ways to give</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Interested in partnership, grants, or in-kind support? Reach out via the contact page
                — we'd love to talk.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
