export type Ga4DateRange = "today" | "7d" | "30d" | "12m";

export type Ga4TimePoint = {
  date: string;
  users: number;
  pageViews: number;
  sessions: number;
};

export type Ga4BreakdownItem = {
  label: string;
  users: number;
  share: number;
};

export type Ga4PageItem = {
  path: string;
  views: number;
  share: number;
};

export type Ga4AnalyticsData = {
  range: Ga4DateRange;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  pageViews: number;
  sessions: number;
  usersToday: number;
  timeSeries: Ga4TimePoint[];
  topPages: Ga4PageItem[];
  trafficSources: Ga4BreakdownItem[];
  devices: Ga4BreakdownItem[];
  countries: Ga4BreakdownItem[];
  fetchedAt: string;
};

export const GA4_DATE_RANGE_OPTIONS: { value: Ga4DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "12m", label: "Last 12 Months" },
];

export function ga4RangeLabel(range: Ga4DateRange) {
  return GA4_DATE_RANGE_OPTIONS.find((o) => o.value === range)?.label ?? range;
}
