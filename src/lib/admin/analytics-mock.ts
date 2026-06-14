export type AnalyticsPoint = { date: string; visitors: number; pageViews: number };

export type AnalyticsData = {
  totalVisits: number;
  activeVisitors: number;
  todayVisits: number;
  pageViews: number;
  visitorsSeries: AnalyticsPoint[];
  topPages: { path: string; views: number; share: number }[];
  trafficSources: { source: string; visitors: number; share: number }[];
  devices: { device: string; visitors: number; share: number }[];
  countries: { country: string; visitors: number; share: number }[];
};

const SERIES: AnalyticsPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const base = 120 + Math.round(Math.sin(i / 3) * 35) + i * 2;
  return {
    date: d.toISOString().slice(0, 10),
    visitors: base,
    pageViews: Math.round(base * 2.4),
  };
});

export function getMockAnalytics(): AnalyticsData {
  const totalVisits = SERIES.reduce((sum, p) => sum + p.visitors, 0);
  const todayVisits = SERIES[SERIES.length - 1]?.visitors ?? 0;
  const pageViews = SERIES.reduce((sum, p) => sum + p.pageViews, 0);

  return {
    totalVisits,
    activeVisitors: 18,
    todayVisits,
    pageViews,
    visitorsSeries: SERIES,
    topPages: [
      { path: "/", views: 4820, share: 34 },
      { path: "/programs", views: 2140, share: 15 },
      { path: "/about", views: 1680, share: 12 },
      { path: "/events", views: 1290, share: 9 },
      { path: "/blog", views: 980, share: 7 },
      { path: "/contact", views: 760, share: 5 },
    ],
    trafficSources: [
      { source: "Organic Search", visitors: 4200, share: 38 },
      { source: "Direct", visitors: 3100, share: 28 },
      { source: "Social", visitors: 2100, share: 19 },
      { source: "Referral", visitors: 1100, share: 10 },
      { source: "Email", visitors: 540, share: 5 },
    ],
    devices: [
      { device: "Mobile", visitors: 6200, share: 56 },
      { device: "Desktop", visitors: 4100, share: 37 },
      { device: "Tablet", visitors: 740, share: 7 },
    ],
    countries: [
      { country: "Nigeria", visitors: 7800, share: 71 },
      { country: "Ghana", visitors: 620, share: 6 },
      { country: "United Kingdom", visitors: 540, share: 5 },
      { country: "United States", visitors: 480, share: 4 },
      { country: "Kenya", visitors: 360, share: 3 },
    ],
  };
}
