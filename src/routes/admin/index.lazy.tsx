import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, AdminStatCard, EmptyState } from "@/components/admin/AdminUI";
import { AnalyticsErrorState, AnalyticsStatSkeleton } from "@/components/admin/AnalyticsSkeleton";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { useAdminSession } from "@/hooks/useAdminSession";
import { getAnalyticsErrorDisplay } from "@/lib/admin/analytics-errors";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { permissions } = useAdminSession();
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useAdminAnalytics("30d", permissions.canViewAnalytics);

  const { data: stats } = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: async () => {
      const [posts, publishedPosts, events, publishedEvents, messages, newMessages, subscribers] =
        await Promise.all([
          supabase.from("blog_posts").select("*", { count: "exact", head: true }),
          supabase
            .from("blog_posts")
            .select("*", { count: "exact", head: true })
            .eq("published", true),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }).eq("published", true),
          supabase.from("contact_messages").select("*", { count: "exact", head: true }),
          supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
          supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
        ]);

      return {
        posts: posts.count ?? 0,
        publishedPosts: publishedPosts.count ?? 0,
        events: events.count ?? 0,
        publishedEvents: publishedEvents.count ?? 0,
        messages: messages.count ?? 0,
        newMessages: newMessages.count ?? 0,
        subscribers: subscribers.count ?? 0,
      };
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Dashboard Overview"
        description="Monitor website activity, content performance, and community engagement."
      />

      {permissions.canViewAnalytics && analyticsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AnalyticsStatSkeleton key={i} />
          ))}
        </div>
      ) : permissions.canViewAnalytics && analyticsError ? (
        (() => {
          const display = getAnalyticsErrorDisplay(analyticsError);
          return (
            <AnalyticsErrorState
              title={display.title}
              message={display.message}
              details={display.details}
              onRetry={() => refetchAnalytics()}
            />
          );
        })()
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {permissions.canViewAnalytics && analytics?.source === "ga4" ? (
            <>
              <AdminStatCard
                label="Total users (30d)"
                value={analytics.totalUsers.toLocaleString()}
                accent="primary"
              />
              <AdminStatCard
                label="Active users"
                value={analytics.activeUsers.toLocaleString()}
                accent="magenta"
              />
              <AdminStatCard
                label="New users (30d)"
                value={analytics.newUsers.toLocaleString()}
                accent="cyan"
              />
              <AdminStatCard
                label="Page views (30d)"
                value={analytics.pageViews.toLocaleString()}
                accent="gold"
              />
            </>
          ) : null}
          <AdminStatCard
            label="Blog posts published"
            value={stats?.publishedPosts ?? 0}
            accent="primary"
          />
          <AdminStatCard
            label="Events published"
            value={stats?.publishedEvents ?? 0}
            accent="cyan"
          />
          <AdminStatCard
            label="Contact submissions"
            value={stats?.messages ?? 0}
            accent="magenta"
          />
          <AdminStatCard label="New messages" value={stats?.newMessages ?? 0} accent="gold" />
          <AdminStatCard
            label="Newsletter subscribers"
            value={stats?.subscribers ?? 0}
            accent="primary"
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="brand-card rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Top visited pages</h2>
            {permissions.canViewAnalytics && (
              <Link
                to="/admin/analytics"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View analytics
              </Link>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {permissions.canViewAnalytics && analyticsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-surface" />
              ))
            ) : permissions.canViewAnalytics && analytics?.topPages.length ? (
              analytics.topPages.slice(0, 5).map((page) => (
                <div key={page.path} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{page.path}</span>
                  <span className="text-muted-foreground">{page.views.toLocaleString()} views</span>
                </div>
              ))
            ) : permissions.canViewAnalytics && analyticsError ? (
              <p className="text-sm text-muted-foreground">
                {getAnalyticsErrorDisplay(analyticsError).title}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No page analytics available yet.</p>
            )}
          </div>
        </section>

        <section className="brand-card rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-bold">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            {permissions.canManageBlog && (
              <Link
                to="/admin/blog"
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:bg-surface"
              >
                Manage blog posts <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {permissions.canManageEvents && (
              <Link
                to="/admin/events"
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:bg-surface"
              >
                Manage events <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {permissions.canManageMessages && (
              <Link
                to="/admin/messages"
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:bg-surface"
              >
                Review contact messages <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      </div>

      {!stats && (
        <div className="mt-8">
          <EmptyState
            title="Loading dashboard data"
            description="Fetching latest content and engagement metrics."
          />
        </div>
      )}
    </>
  );
}
