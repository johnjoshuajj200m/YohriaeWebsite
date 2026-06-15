import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { Ga4AnalyticsData, Ga4BreakdownItem, Ga4DateRange, Ga4PageItem } from "./analytics.types";
import { GA_NOT_CONNECTED } from "./analytics-errors";

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = { data: Ga4AnalyticsData; expiresAt: number };
const cache = new Map<string, CacheEntry>();

let client: BetaAnalyticsDataClient | null = null;

function getGa4Config() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();

  if (!propertyId || !credentialsJson) {
    throw new Error(GA_NOT_CONNECTED);
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(credentialsJson) as Record<string, unknown>;
  } catch {
    throw new Error(GA_NOT_CONNECTED);
  }

  return { propertyId, credentials };
}

function getClient(credentials: Record<string, unknown>) {
  if (!client) {
    client = new BetaAnalyticsDataClient({ credentials });
  }
  return client;
}

function propertyPath(propertyId: string) {
  return `properties/${propertyId}`;
}

function rangeToDates(range: Ga4DateRange) {
  switch (range) {
    case "today":
      return { startDate: "today", endDate: "today" };
    case "7d":
      return { startDate: "7daysAgo", endDate: "today" };
    case "30d":
      return { startDate: "30daysAgo", endDate: "today" };
    case "12m":
      return { startDate: "365daysAgo", endDate: "today" };
  }
}

function parseMetric(row: { metricValues?: { value?: string | null }[] | null } | null | undefined, index: number) {
  return Number(row?.metricValues?.[index]?.value ?? 0);
}

function formatGaDate(value: string) {
  if (value.length === 8) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  if (value.length === 6) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}`;
  }
  if (/^\d{1,2}$/.test(value)) {
    return `${value.padStart(2, "0")}:00`;
  }
  return value;
}

function withShares<T extends { users: number }>(items: T[]): (T & { share: number })[] {
  const total = items.reduce((sum, item) => sum + item.users, 0);
  return items.map((item) => ({
    ...item,
    share: total > 0 ? Math.round((item.users / total) * 100) : 0,
  }));
}

function withViewShares(items: Ga4PageItem[]): Ga4PageItem[] {
  const total = items.reduce((sum, item) => sum + item.views, 0);
  return items.map((item) => ({
    ...item,
    share: total > 0 ? Math.round((item.views / total) * 100) : 0,
  }));
}

async function fetchActiveUsers(client: BetaAnalyticsDataClient, property: string) {
  try {
    const [response] = await client.runRealtimeReport({
      property,
      metrics: [{ name: "activeUsers" }],
    });
    return parseMetric(response.rows?.[0], 0);
  } catch {
    return 0;
  }
}

async function fetchSummary(
  client: BetaAnalyticsDataClient,
  property: string,
  range: Ga4DateRange,
) {
  const dateRanges = [rangeToDates(range)];
  const [response] = await client.runReport({
    property,
    dateRanges,
    metrics: [
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "screenPageViews" },
      { name: "sessions" },
    ],
  });

  const row = response.rows?.[0];
  return {
    totalUsers: parseMetric(row, 0),
    newUsers: parseMetric(row, 1),
    pageViews: parseMetric(row, 2),
    sessions: parseMetric(row, 3),
  };
}

async function fetchUsersToday(client: BetaAnalyticsDataClient, property: string) {
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: "today", endDate: "today" }],
    metrics: [{ name: "activeUsers" }],
  });
  return parseMetric(response.rows?.[0], 0);
}

async function fetchTimeSeries(
  client: BetaAnalyticsDataClient,
  property: string,
  range: Ga4DateRange,
) {
  const dimensionName = range === "today" ? "hour" : range === "12m" ? "yearMonth" : "date";

  const [response] = await client.runReport({
    property,
    dateRanges: [rangeToDates(range)],
    dimensions: [{ name: dimensionName }],
    metrics: [
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "sessions" },
    ],
    orderBys: [{ dimension: { dimensionName } }],
  });

  return (response.rows ?? []).map((row) => ({
    date: formatGaDate(row.dimensionValues?.[0]?.value ?? ""),
    users: parseMetric(row, 0),
    pageViews: parseMetric(row, 1),
    sessions: parseMetric(row, 2),
  }));
}

async function fetchBreakdown(
  client: BetaAnalyticsDataClient,
  property: string,
  range: Ga4DateRange,
  dimensionName: string,
  limit = 8,
): Promise<Ga4BreakdownItem[]> {
  const [response] = await client.runReport({
    property,
    dateRanges: [rangeToDates(range)],
    dimensions: [{ name: dimensionName }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit,
  });

  const items = (response.rows ?? []).map((row) => ({
    label: row.dimensionValues?.[0]?.value || "(not set)",
    users: parseMetric(row, 0),
    share: 0,
  }));

  return withShares(items).map(({ label, users, share }) => ({ label, users, share }));
}

async function fetchTopPages(
  client: BetaAnalyticsDataClient,
  property: string,
  range: Ga4DateRange,
): Promise<Ga4PageItem[]> {
  const [response] = await client.runReport({
    property,
    dateRanges: [rangeToDates(range)],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
  });

  const items = (response.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || "/",
    views: parseMetric(row, 0),
    share: 0,
  }));

  return withViewShares(items);
}

export async function getGa4Analytics(range: Ga4DateRange): Promise<Ga4AnalyticsData> {
  const cacheKey = range;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const { propertyId, credentials } = getGa4Config();
  const gaClient = getClient(credentials);
  const property = propertyPath(propertyId);

  const [
    realtimeActiveUsers,
    summary,
    usersToday,
    timeSeries,
    topPages,
    trafficSources,
    devices,
    countries,
  ] = await Promise.all([
    fetchActiveUsers(gaClient, property),
    fetchSummary(gaClient, property, range),
    fetchUsersToday(gaClient, property),
    fetchTimeSeries(gaClient, property, range),
    fetchTopPages(gaClient, property, range),
    fetchBreakdown(gaClient, property, range, "sessionDefaultChannelGroup"),
    fetchBreakdown(gaClient, property, range, "deviceCategory"),
    fetchBreakdown(gaClient, property, range, "country"),
  ]);

  const data: Ga4AnalyticsData = {
    range,
    totalUsers: summary.totalUsers,
    activeUsers: realtimeActiveUsers,
    newUsers: summary.newUsers,
    pageViews: summary.pageViews,
    sessions: summary.sessions,
    usersToday,
    timeSeries,
    topPages,
    trafficSources,
    devices,
    countries,
    fetchedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}
