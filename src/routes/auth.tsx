import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { userHasDashboardAccess } from "@/lib/admin/access";
import { AUTH_INITIATE_PATH, DEFAULT_POST_AUTH_PATH } from "@/lib/auth";

type AuthSearch = {
  error?: string;
};

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Admin Sign In — YOHRIAE" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: Auth,
});

async function logAdminLookup(user: { id: string; email?: string | null }) {
  console.log("[admin auth] authenticated user id", user.id);
  console.log("[admin auth] authenticated email", user.email ?? null);

  const results = [];
  const lookups: Array<{ column: "user_id" | "id" | "email"; value: string }> = [
    { column: "user_id", value: user.id },
    { column: "id", value: user.id },
    ...(user.email ? [{ column: "email" as const, value: user.email }] : []),
  ];

  for (const lookup of lookups) {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq(lookup.column, lookup.value);

    console.log(`[admin auth] public.admins result (${lookup.column})`, { data, error });
    if (data) results.push(...data);
  }

  const role =
    results.find((admin) => ["super_admin", "admin", "editor", "viewer"].includes(admin.role))
      ?.role ?? null;
  console.log("[admin auth] role value", role);
}

function Auth() {
  const navigate = useNavigate();
  const { error: urlError } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlError) setError(urlError);
  }, [urlError]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError(
        "Authentication is temporarily unavailable. Check Supabase environment configuration.",
      );
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (data.session) {
          await logAdminLookup(data.session.user);
        }

        if (
          data.session &&
          (await userHasDashboardAccess(data.session.user.id, data.session.user.email))
        ) {
          navigate({ to: DEFAULT_POST_AUTH_PATH, replace: true });
        }
      })
      .catch((err) => {
        console.error("[auth] Session check failed:", err);
      });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      if (data.user) {
        await logAdminLookup(data.user);
      }

      if (!data.user || !(await userHasDashboardAccess(data.user.id, data.user.email))) {
        await supabase.auth.signOut();
        throw new Error("Access denied. This account is not authorized for the admin dashboard.");
      }
      navigate({ to: DEFAULT_POST_AUTH_PATH, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    setError(null);
    const params = new URLSearchParams({
      provider: "google",
      redirect_uri: `${window.location.origin}${DEFAULT_POST_AUTH_PATH}`,
    });
    window.location.href = `${AUTH_INITIATE_PATH}?${params.toString()}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-secondary/40 via-background to-primary/5">
      <header className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
          <h1 className="text-2xl font-black">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authorized YOHRIAE staff only. Public account registration is not available.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-foreground">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Need access? Contact an existing YOHRIAE administrator.
          </p>
          <p className="mt-3 text-center text-xs">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              ← Back to site
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
