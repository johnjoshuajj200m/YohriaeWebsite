import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { userHasDashboardAccess } from "@/lib/admin/access";
import { normalizeRedirectPath } from "@/lib/auth";

type CallbackSearch = {
  next?: string;
  error?: string;
  error_description?: string;
};

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Completing sign-in — YOHRIAE" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    next: typeof search.next === "string" ? search.next : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string" ? search.error_description : undefined,
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function finishSignIn() {
      const nextPath = normalizeRedirectPath(search.next);

      if (search.error || search.error_description) {
        const err = search.error_description ?? search.error ?? "Sign-in was cancelled.";
        navigate({
          to: "/auth",
          search: { error: err },
          replace: true,
        });
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = hashParams.get("error_description") ?? hashParams.get("error");
      if (hashError) {
        navigate({
          to: "/auth",
          search: { error: hashError },
          replace: true,
        });
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        window.location.href,
      );

      if (exchangeError) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          if (!cancelled) {
            navigate({
              to: "/auth",
              search: { error: exchangeError.message },
              replace: true,
            });
          }
          return;
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      const email = sessionData.session?.user?.email;
      if (!userId) {
        if (!cancelled) {
          navigate({
            to: "/auth",
            search: { error: "Sign-in failed. Please try again." },
            replace: true,
          });
        }
        return;
      }

      if (!(await userHasDashboardAccess(userId, email))) {
        await supabase.auth.signOut();
        if (!cancelled) {
          navigate({
            to: "/auth",
            search: {
              error: "Access denied. This account is not authorized for the admin dashboard.",
            },
            replace: true,
          });
        }
        return;
      }

      if (!cancelled) {
        navigate({ to: nextPath, replace: true });
      }
    }

    finishSignIn().catch((err) => {
      if (cancelled) return;
      setMessage("Sign-in failed.");
      navigate({
        to: "/auth",
        search: { error: err instanceof Error ? err.message : "Sign-in failed" },
        replace: true,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, search.error, search.error_description, search.next]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <p className="text-sm font-semibold text-foreground">{message}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          You will be redirected to the admin area shortly.
        </p>
        <Link to="/auth" className="mt-6 inline-block text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
