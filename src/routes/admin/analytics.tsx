import { createFileRoute } from "@tanstack/react-router";
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
import { getMockAnalytics } from "@/lib/admin/analytics-mock";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

const COLORS = ["#0F4C81", "#C2188F", "#00A7C8", "#F5A623", "#6B7280"];

function AdminAnalytics() {
  const data = getMockAnalytics();

  return (
    <>
      <AdminPageHeader
        title="Website Analytics"
        description="GA4 traffic overview for visitors, acquisition, content performance, devices, and countries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total visitors" value={data.totalVisits.toLocaleString()} accent="cyan" />
        <AdminStatCard label="Active visitors" value={data.activeVisitors.toLocaleString()} accent="magenta" />
        <AdminStatCard label="Visitors today" value={data.todayVisits.toLocaleString()} accent="gold" />
        <AdminStatCard label="Page views" value={data.pageViews.toLocaleString()} accent="cyan" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="brand-card rounded-xl border border-border bg-background p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience</p>
              <h2 className="text-lg font-bold">Visitors over time</h2>
            </div>
            <span className="rounded-md bg-surface px-3 py-1 text-xs font-semibold text-primary">Last 30 days</span>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.visitorsSeries}>
                <defs>
                  <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A7C8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00A7C8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="visitors" stroke="#00A7C8" fill="url(#visitorsFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="brand-card rounded-xl border border-border bg-background p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acquisition</p>
          <h2 className="text-lg font-bold">Traffic sources</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.trafficSources} dataKey="visitors" nameKey="source" innerRadius={55} outerRadius={90}>
                  {data.trafficSources.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {data.trafficSources.map((s, i) => (
              <div key={s.source} className="flex justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {s.source}
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
          <h2 className="text-lg font-bold">Top pages</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topPages} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="path" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#0F4C81" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="brand-card rounded-xl border border-border bg-background p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience profile</p>
          <h2 className="text-lg font-bold">Device types & visitor countries</h2>
          <div className="mt-4 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Device type</p>
              <div className="mt-2 space-y-2">
                {data.devices.map((d) => (
                  <div key={d.device}>
                    <div className="flex justify-between text-sm">
                      <span>{d.device}</span>
                      <span className="text-muted-foreground">{d.share}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-surface">
                      <div className="h-2 rounded-full bg-[var(--brand-magenta)]" style={{ width: `${d.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Countries</p>
              <div className="mt-2 space-y-2">
                {data.countries.map((c) => (
                  <div key={c.country} className="flex justify-between text-sm">
                    <span>{c.country}</span>
                    <span className="text-muted-foreground">{c.visitors.toLocaleString()} ({c.share}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
