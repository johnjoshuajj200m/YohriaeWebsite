import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminPageHeader, AdminStatCard } from "@/components/admin/AdminUI";
import {
  AnalyticsErrorState,
  AnalyticsPageSkeleton,
} from "@/components/admin/AnalyticsSkeleton";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import {
  GA4_DATE_RANGE_OPTIONS,
  ga4RangeLabel,
  type Ga4DateRange,
} from "@/lib/admin/analytics.types";
import { GA_NOT_CONNECTED } from "@/lib/admin/analytics-errors";

function analyticsErrorDisplay(error: Error) {
  if (error.message === GA_NOT_CONNECTED) {
    return {
      title: GA_NOT_CONNECTED,
      message:
        "Add GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_JSON to your server environment (Vercel), then redeploy.",
    };
  }
  return {
    title: "Could not load Google Analytics",
    message: error.message,
  };
}

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

const COLORS = ["#0F4C81", "#C2188F", "#00A7C8", "#F5A623", "#6B7280"];

function AdminAnalytics() {
  const [range, setRange] = useState<Ga4DateRange>("30d");
  const { data, isLoading, isFetching, error, refetch } = useAdminAnalytics(range);

  return (
    <>
      <AdminPageHeader
        title="Website Analytics"
        description="Live Google Analytics 4 data for visitors, acquisition, content performance, devices, and countries."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {GA4_DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  range === option.value
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        }
      />

      {isLoading ? (
        <AnalyticsPageSkeleton />
      ) : error ? (
        (() => {
          const display = analyticsErrorDisplay(
            error instanceof Error ? error : new Error("Unknown analytics error."),
          );
          return (
            <AnalyticsErrorState
              title={display.title}
              message={display.message}
              onRetry={() => refetch()}
            />
          );
        })()
      ) : data ? (
        <>
          <p className="mb-4 text-xs text-muted-foreground">
            Showing {ga4RangeLabel(range)} · Last updated{" "}
            {new Date(data.fetchedAt).toLocaleString()} · Auto-refreshes every 60 seconds
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <AdminStatCard label="Total users" value={data.totalUsers.toLocaleString()} accent="primary" />
            <AdminStatCard label="Active users" value={data.activeUsers.toLocaleString()} accent="magenta" />
            <AdminStatCard label="Users today" value={data.usersToday.toLocaleString()} accent="cyan" />
            <AdminStatCard label="Page views" value={data.pageViews.toLocaleString()} accent="gold" />
            <AdminStatCard label="Sessions" value={data.sessions.toLocaleString()} accent="cyan" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <section className="brand-card rounded-xl border border-border bg-background p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience</p>
                  <h2 className="text-lg font-bold">Users over time</h2>
                </div>
                <span className="rounded-md bg-surface px-3 py-1 text-xs font-semibold text-primary">
                  {ga4RangeLabel(range)}
                </span>
              </div>
              <div className="mt-6 h-72">
                {data.timeSeries.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No time-series data for this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeSeries}>
                      <defs>
                        <linearGradient id="gaUsersFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00A7C8" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#00A7C8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#00A7C8"
                        fill="url(#gaUsersFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="brand-card rounded-xl border border-border bg-background p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acquisition</p>
              <h2 className="text-lg font-bold">Traffic sources</h2>
              <div className="mt-4 h-72">
                {data.trafficSources.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No traffic source data.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.trafficSources}
                        dataKey="users"
                        nameKey="label"
                        innerRadius={55}
                        outerRadius={90}
                      >
                        {data.trafficSources.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-2 space-y-1">
                {data.trafficSources.map((s, i) => (
                  <div key={s.label} className="flex justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {s.label}
                    </span>
                    <span className="text-muted-foreground">{s.share}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="brand-card rounded-xl border border-border bg-background p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content</p>
              <h2 className="text-lg font-bold">Most visited pages</h2>
              <div className="mt-6 h-64">
                {data.topPages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No page data for this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topPages} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="path" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="views" fill="#0F4C81" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="brand-card rounded-xl border border-border bg-background p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience profile</p>
              <h2 className="text-lg font-bold">Device categories & top countries</h2>
              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Device category
                  </p>
                  <div className="mt-2 space-y-2">
                    {data.devices.map((d) => (
                      <div key={d.label}>
                        <div className="flex justify-between text-sm">
                          <span>{d.label}</span>
                          <span className="text-muted-foreground">{d.share}%</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-surface">
                          <div
                            className="h-2 rounded-full bg-[var(--brand-magenta)]"
                            style={{ width: `${d.share}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Top countries
                  </p>
                  <div className="mt-2 space-y-2">
                    {data.countries.map((c) => (
                      <div key={c.label} className="flex justify-between text-sm">
                        <span>{c.label}</span>
                        <span className="text-muted-foreground">
                          {c.users.toLocaleString()} ({c.share}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
