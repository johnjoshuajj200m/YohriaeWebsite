import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAuthCallbackUrl, normalizeRedirectPath } from "@/lib/auth";

type InitiateSearch = {
  provider?: string;
  redirect_uri?: string;
};

export const Route = createFileRoute("/auth/initiate")({
  head: () => ({
    meta: [{ title: "Signing in — YOHRIAE" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (search: Record<string, unknown>): InitiateSearch => ({
    provider: typeof search.provider === "string" ? search.provider : "google",
    redirect_uri: typeof search.redirect_uri === "string" ? search.redirect_uri : undefined,
  }),
  component: AuthInitiate,
});

function AuthInitiate() {
  const { provider, redirect_uri } = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startOAuth() {
      if (provider !== "google") {
        setError("Only Google sign-in is supported right now.");
        return;
      }

      const nextPath = normalizeRedirectPath(redirect_uri);
      const redirectTo = getAuthCallbackUrl(nextPath);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (!cancelled && oauthError) {
        setError(oauthError.message);
      }
    }

    startOAuth();

    return () => {
      cancelled = true;
    };
  }, [provider, redirect_uri]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        {error ? (
          <>
            <p className="text-sm font-semibold text-destructive">Sign-in could not start</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <a href="/auth" className="btn-primary mt-6 inline-flex">
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground">Redirecting to Google…</p>
            <p className="mt-2 text-sm text-muted-foreground">Please wait while we open secure sign-in.</p>
          </>
        )}
      </div>
    </div>
  );
}
