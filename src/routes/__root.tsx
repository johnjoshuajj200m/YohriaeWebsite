import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { initializeAnalytics, trackPageView } from "@/lib/analytics";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-primary"
          >
            Back to YOHRIAE
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "YOHRIAE — Youth Health and Right Initiative for Advocacy and Empowerment" },
      {
        name: "description",
        content:
          "YOHRIAE empowers young people and vulnerable communities across Northern Nigeria through health, human rights, advocacy and sustainable development.",
      },
      { name: "author", content: "YOHRIAE" },
      { property: "og:site_name", content: "YOHRIAE" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "YOHRIAE — Youth Health and Right Initiative for Advocacy and Empowerment" },
      {
        property: "og:description",
        content:
          "Health, human rights, advocacy and sustainable development for young people and vulnerable communities in Northern Nigeria.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0F4C81" },
      { name: "twitter:title", content: "YOHRIAE — Youth Health and Right Initiative for Advocacy and Empowerment" },
      { name: "description", content: "YOHRIAE advances youth health, human rights, advocacy, and community empowerment across Northern Nigeria." },
      { property: "og:description", content: "YOHRIAE advances youth health, human rights, advocacy, and community empowerment across Northern Nigeria." },
      { name: "twitter:description", content: "YOHRIAE advances youth health, human rights, advocacy, and community empowerment across Northern Nigeria." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/455a4834-473e-498a-96ee-f27782a83a37/id-preview-7228dcee--bc2d6ffa-72f5-4f13-b479-e0b873f18d0e.lovable.app-1781368796558.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/455a4834-473e-498a-96ee-f27782a83a37/id-preview-7228dcee--bc2d6ffa-72f5-4f13-b479-e0b873f18d0e.lovable.app-1781368796558.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NGO",
          name: "YOHRIAE",
          alternateName: "Youth Health and Right Initiative for Advocacy and Empowerment",
          url: "/",
          areaServed: "Northern Nigeria",
          foundingDate: "2019",
          description:
            "YOHRIAE empowers young people and vulnerable communities through health, human rights, advocacy and sustainable development.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  useEffect(() => {
    initializeAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.href);
  }, [location.href]);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteLayout />
    </QueryClientProvider>
  );
}

// Keep Outlet referenced so tree-shake doesn't drop it.
export const _Outlet = Outlet;
