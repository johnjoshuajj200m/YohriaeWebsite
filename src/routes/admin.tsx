import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { Mail, FileText, Calendar, Users, ImageIcon, LogOut, Home, Shield } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — YOHRIAE" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/auth" });
      } else {
        setUserId(data.user.id);
      }
      setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!userId) return null;

  return <Dashboard userId={userId} />;
}

function Dashboard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: roles = [] } = useQuery({
    queryKey: ["my-roles", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });

  const isAdmin = roles.includes("admin");
  const isEditor = roles.includes("editor") || isAdmin;

  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [msgs, posts, events, team] = await Promise.all([
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("team_members").select("*", { count: "exact", head: true }),
      ]);
      return {
        messages: msgs.count ?? 0,
        posts: posts.count ?? 0,
        events: events.count ?? 0,
        team: team.count ?? 0,
      };
    },
    enabled: isEditor,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary sm:inline-flex">
              <Home className="h-4 w-4" /> View site
            </Link>
            <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:bg-secondary">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest brand-gradient-text">YOHRIAE Admin</p>
            <h1 className="mt-1 text-3xl font-black">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5 text-primary" />
            {isAdmin ? "Admin" : isEditor ? "Editor" : "No role assigned"}
          </div>
        </div>

        {!isEditor && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-semibold">You're signed in, but no role has been assigned to your account yet.</p>
            <p className="mt-2">
              Ask an existing admin to grant you the <code className="rounded bg-amber-100 px-1">admin</code> or <code className="rounded bg-amber-100 px-1">editor</code> role.
              Your user ID: <code className="break-all rounded bg-amber-100 px-1">{userId}</code>
            </p>
            <p className="mt-2 text-xs">
              First-time setup: the project owner can grant admin via the database — see the Admin Setup card below.
            </p>
          </div>
        )}

        {isEditor && counts && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard Icon={Mail} label="Messages" value={counts.messages} />
            <StatCard Icon={FileText} label="Blog posts" value={counts.posts} />
            <StatCard Icon={Calendar} label="Events" value={counts.events} />
            <StatCard Icon={Users} label="Team members" value={counts.team} />
          </div>
        )}

        {isEditor && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: FileText, label: "Blog posts", desc: "Coming next: create, edit & publish posts." },
              { Icon: Calendar, label: "Events", desc: "Coming next: schedule and manage events." },
              { Icon: Users, label: "Team", desc: "Coming next: add and order team profiles." },
              { Icon: ImageIcon, label: "Gallery", desc: "Coming next: upload and curate photos." },
            ].map(({ Icon, label, desc }) => (
              <div key={label} className="rounded-2xl border border-border bg-background p-5">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-bold">{label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        )}

        {isAdmin && (
          <section className="mt-10">
            <h2 className="text-lg font-bold">Recent contact messages</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background">
              {messages.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {messages.map((m) => (
                    <li key={m.id} className="p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold">{m.name} <span className="font-normal text-muted-foreground">· {m.email}</span></p>
                        <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                      {m.subject && <p className="mt-1 text-sm font-semibold">{m.subject}</p>}
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{m.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-dashed border-border bg-background p-6">
          <h2 className="font-bold">Admin Setup (first time)</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            To grant the first admin role, the project owner can run this SQL against the database
            (replace the placeholder with the user ID shown above):
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-secondary p-3 text-xs">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${userId}', 'admin');`}
          </pre>
        </section>
      </main>
    </div>
  );
}

function StatCard({ Icon, label, value }: { Icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-primary" />
        <p className="text-3xl font-black">{value}</p>
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
