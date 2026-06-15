import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { Ga4AnalyticsData, Ga4BreakdownItem, Ga4DateRange, Ga4PageItem } from "./analytics.types";
import { GA_NOT_CONFIGURED } from "./analytics-errors";

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = { data: Ga4AnalyticsData; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function readEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

function normalizePrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

export function getGa4Credentials():
  | { propertyId: string; clientEmail: string; privateKey: string }
  | { error: string } {
  const propertyId = readEnv("GA4_PROPERTY_ID");
  const clientEmail = readEnv("GOOGLE_CLIENT_EMAIL");
  const privateKeyRaw = readEnv("GOOGLE_PRIVATE_KEY");

  if (propertyId && clientEmail && privateKeyRaw) {
    return {
      propertyId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKeyRaw),
    };
  }

  // Backward-compatible fallback: single JSON blob (local dev / legacy Vercel setup).
  const credentialsJson = readEnv("GA4_SERVICE_ACCOUNT_JSON");
  if (propertyId && credentialsJson) {
    try {
      const parsed = JSON.parse(credentialsJson) as {
        client_email?: string;
        private_key?: string;
      };
      if (parsed.client_email && parsed.private_key) {
        return {
          propertyId,
          clientEmail: parsed.client_email,
          privateKey: normalizePrivateKey(parsed.private_key),
        };
      }
    } catch {
      return { error: GA_NOT_CONFIGURED };
    }
  }

  const missing = [
    ...(!propertyId ? ["GA4_PROPERTY_ID"] : []),
    ...(!clientEmail ? ["GOOGLE_CLIENT_EMAIL"] : []),
    ...(!privateKeyRaw ? ["GOOGLE_PRIVATE_KEY"] : []),
  ];

  if (missing.length > 0) {
    console.warn("[ga4] Missing server env:", missing.join(", "));
  }

  return { error: GA_NOT_CONFIGURED };
}

function createGa4Client(clientEmail: string, privateKey: string) {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[ga4] Realtime activeUsers unavailable:", message);
    return 0;
  }
}

async function fetchSummary(
  client: BetaAnalyticsDataClient,
  property: string,
  range: Ga4DateRange,
) {
  const [response] = await client.runReport({
    property,
    dateRanges: [rangeToDates(range)],
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

  const config = getGa4Credentials();
  if ("error" in config) {
    throw new Error(config.error);
  }

  const { propertyId, clientEmail, privateKey } = config;
  const gaClient = createGa4Client(clientEmail, privateKey);
  const property = propertyPath(propertyId);

  console.info("[ga4] Fetching analytics for property", propertyId, "range", range);

  try {
    const [
      activeUsers,
      summary,
      timeSeries,
      topPages,
      trafficSources,
      devices,
      countries,
    ] = await Promise.all([
      fetchActiveUsers(gaClient, property),
      fetchSummary(gaClient, property, range),
      fetchTimeSeries(gaClient, property, range),
      fetchTopPages(gaClient, property, range),
      fetchBreakdown(gaClient, property, range, "sessionDefaultChannelGroup"),
      fetchBreakdown(gaClient, property, range, "deviceCategory"),
      fetchBreakdown(gaClient, property, range, "country"),
    ]);

    const data: Ga4AnalyticsData = {
      source: "ga4",
      propertyId,
      range,
      totalUsers: summary.totalUsers,
      activeUsers,
      newUsers: summary.newUsers,
      pageViews: summary.pageViews,
      sessions: summary.sessions,
      timeSeries,
      topPages,
      trafficSources,
      devices,
      countries,
      fetchedAt: new Date().toISOString(),
    };

    cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    console.info("[ga4] Analytics loaded:", {
      propertyId,
      range,
      totalUsers: data.totalUsers,
      pageViews: data.pageViews,
    });
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ga4] Data API request failed:", message);
    throw err instanceof Error ? err : new Error(message);
  }
}
