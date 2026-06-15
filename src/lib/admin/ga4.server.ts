import { createSign } from "node:crypto";
import type {
  Ga4AnalyticsData,
  Ga4BreakdownItem,
  Ga4DateRange,
  Ga4PageItem,
} from "./analytics.types";
import { GA_NOT_CONFIGURED, GA_SERVER_ERROR } from "./analytics-errors";

const CACHE_TTL_MS = 5 * 60 * 1000;
const ACCESS_TOKEN_TTL_MS = 50 * 60 * 1000;
const GA_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";

type CacheEntry = { data: Ga4AnalyticsData; expiresAt: number };
const cache = new Map<string, CacheEntry>();

type AccessTokenEntry = { token: string; expiresAt: number };
let accessTokenCache: (AccessTokenEntry & { clientEmail: string }) | undefined;

export type Ga4AnalyticsResult =
  | { ok: true; data: Ga4AnalyticsData }
  | { ok: false; error: string; details?: string };

function readEnv(name: string) {
  try {
    return process.env[name]?.trim() || undefined;
  } catch (error) {
    console.error("[ga4] unhandled error", error);
    return undefined;
  }
}

function normalizePrivateKey(key: string) {
  const trimmed = key.trim();
  const unquoted =
    trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
  return unquoted.replace(/\\n/g, "\n");
}

function isValidPropertyId(value: string) {
  return /^\d+$/.test(value);
}

function looksLikeMeasurementId(value: string) {
  return /^G-[A-Z0-9]+$/i.test(value);
}

function isPemPrivateKey(value: string) {
  return value.includes("BEGIN PRIVATE KEY") || value.includes("BEGIN RSA PRIVATE KEY");
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ga4Failure(error: unknown, hint?: string): Ga4AnalyticsResult {
  console.error("[ga4] unhandled error", error);
  const baseMessage = String(error instanceof Error ? error.message : error);
  return {
    ok: false,
    error: GA_SERVER_ERROR,
    details: hint ? `${baseMessage} — ${hint}` : baseMessage,
  };
}

export type Ga4ConfigDiagnostic = {
  hasPropertyId: boolean;
  propertyIdIsNumeric: boolean;
  propertyIdLooksLikeMeasurementId: boolean;
  hasClientEmail: boolean;
  clientEmailLooksValid: boolean;
  hasPrivateKey: boolean;
  privateKeyIsPem: boolean;
  configured: boolean;
  message: string;
};

export function describeGa4Config(): Ga4ConfigDiagnostic {
  const propertyId = readEnv("GA4_PROPERTY_ID");
  const clientEmail = readEnv("GOOGLE_CLIENT_EMAIL");
  const privateKeyRaw = readEnv("GOOGLE_PRIVATE_KEY");
  const privateKey = privateKeyRaw ? normalizePrivateKey(privateKeyRaw) : "";

  const hasPropertyId = Boolean(propertyId);
  const propertyIdIsNumeric = hasPropertyId && isValidPropertyId(propertyId!);
  const propertyIdLooksLikeMeasurementId = hasPropertyId && looksLikeMeasurementId(propertyId!);
  const hasClientEmail = Boolean(clientEmail);
  const clientEmailLooksValid = hasClientEmail && looksLikeEmail(clientEmail!);
  const hasPrivateKey = Boolean(privateKey);
  const privateKeyIsPem = hasPrivateKey && isPemPrivateKey(privateKey);

  const issues: string[] = [];
  if (!hasPropertyId) issues.push("GA4_PROPERTY_ID is missing");
  else if (propertyIdLooksLikeMeasurementId)
    issues.push(
      "GA4_PROPERTY_ID looks like a Measurement ID (G-XXXX). It must be the numeric Property ID from GA4 admin.",
    );
  else if (!propertyIdIsNumeric) issues.push("GA4_PROPERTY_ID must contain only digits");
  if (!hasClientEmail) issues.push("GOOGLE_CLIENT_EMAIL is missing");
  else if (!clientEmailLooksValid) issues.push("GOOGLE_CLIENT_EMAIL is not a valid email");
  if (!hasPrivateKey) issues.push("GOOGLE_PRIVATE_KEY is missing");
  else if (!privateKeyIsPem)
    issues.push(
      "GOOGLE_PRIVATE_KEY is not a PEM key (must contain BEGIN PRIVATE KEY). Escaped \\n newlines are supported.",
    );

  const configured = issues.length === 0;

  return {
    hasPropertyId,
    propertyIdIsNumeric,
    propertyIdLooksLikeMeasurementId,
    hasClientEmail,
    clientEmailLooksValid,
    hasPrivateKey,
    privateKeyIsPem,
    configured,
    message: configured ? "GA4 credentials look valid." : issues.join(" "),
  };
}

export function getGa4Credentials():
  | { propertyId: string; clientEmail: string; privateKey: string }
  | { error: string; details?: string } {
  try {
    const propertyId = readEnv("GA4_PROPERTY_ID");
    const clientEmail = readEnv("GOOGLE_CLIENT_EMAIL");
    const privateKeyRaw = readEnv("GOOGLE_PRIVATE_KEY");

    if (!propertyId || !clientEmail || !privateKeyRaw) {
      const missing = [
        ...(!propertyId ? ["GA4_PROPERTY_ID"] : []),
        ...(!clientEmail ? ["GOOGLE_CLIENT_EMAIL"] : []),
        ...(!privateKeyRaw ? ["GOOGLE_PRIVATE_KEY"] : []),
      ];
      console.warn("[ga4] Missing server env:", missing.join(", "));
      return { error: GA_NOT_CONFIGURED };
    }

    if (looksLikeMeasurementId(propertyId)) {
      const detail =
        "GA4_PROPERTY_ID looks like a Measurement ID (G-XXXX). Use the numeric Property ID from GA4 Admin → Property settings.";
      console.error("[ga4]", detail);
      return { error: GA_SERVER_ERROR, details: detail };
    }
    if (!isValidPropertyId(propertyId)) {
      const detail = `GA4_PROPERTY_ID must be numeric. Received "${propertyId.slice(0, 20)}".`;
      console.error("[ga4]", detail);
      return { error: GA_SERVER_ERROR, details: detail };
    }

    if (!looksLikeEmail(clientEmail)) {
      const detail = "GOOGLE_CLIENT_EMAIL must be a valid service account email.";
      console.error("[ga4]", detail);
      return { error: GA_SERVER_ERROR, details: detail };
    }

    const privateKey = normalizePrivateKey(privateKeyRaw);
    if (!isPemPrivateKey(privateKey)) {
      const detail =
        "GOOGLE_PRIVATE_KEY is not a PEM key. It must contain BEGIN PRIVATE KEY after \\n → \\n normalization.";
      console.error("[ga4]", detail);
      return { error: GA_SERVER_ERROR, details: detail };
    }

    return {
      propertyId,
      clientEmail,
      privateKey,
    };
  } catch (error) {
    console.error("[ga4] unhandled error", error);
    return {
      error: GA_SERVER_ERROR,
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signServiceAccountJwt(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: GA_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const headerPart = base64UrlEncode(JSON.stringify(header));
  const claimPart = base64UrlEncode(JSON.stringify(claim));
  const signingInput = `${headerPart}.${claimPart}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = base64UrlEncode(signer.sign(privateKey));
  return `${signingInput}.${signature}`;
}

async function fetchAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Date.now();
  if (
    accessTokenCache &&
    accessTokenCache.clientEmail === clientEmail &&
    accessTokenCache.expiresAt > now + 60_000
  ) {
    return accessTokenCache.token;
  }

  const assertion = signServiceAccountJwt(clientEmail, privateKey);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text.slice(0, 400);
    try {
      const parsed = JSON.parse(text) as { error?: string; error_description?: string };
      if (parsed.error || parsed.error_description) {
        detail = `${parsed.error ?? "oauth_error"}: ${parsed.error_description ?? text.slice(0, 200)}`;
      }
    } catch {
      // keep raw text
    }
    throw new Error(`OAuth token request failed (${res.status}): ${detail}`);
  }

  let payload: { access_token?: string; expires_in?: number };
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`OAuth token response was not JSON: ${text.slice(0, 200)}`);
  }

  if (!payload.access_token) {
    throw new Error("OAuth token response missing access_token.");
  }

  const expiresInMs = (payload.expires_in ?? 3600) * 1000;
  accessTokenCache = {
    clientEmail,
    token: payload.access_token,
    expiresAt: now + Math.min(expiresInMs, ACCESS_TOKEN_TTL_MS),
  };

  return payload.access_token;
}

type RunReportRow = {
  dimensionValues?: { value?: string | null }[] | null;
  metricValues?: { value?: string | null }[] | null;
};

type RunReportResponse = {
  rows?: RunReportRow[] | null;
};

async function callGa4Api<T>(params: {
  accessToken: string;
  propertyId: string;
  endpoint: "runReport" | "runRealtimeReport";
  body: Record<string, unknown>;
}): Promise<T> {
  const url = `${DATA_API_BASE}/properties/${params.propertyId}:${params.endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params.body),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = `GA4 ${params.endpoint} failed (${res.status})`;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string; status?: string } };
      const detail = parsed.error?.message ?? text.slice(0, 300);
      message = `${message}: ${detail}${parsed.error?.status ? ` [${parsed.error.status}]` : ""}`;
    } catch {
      message = `${message}: ${text.slice(0, 300)}`;
    }
    throw new Error(message);
  }

  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(`GA4 ${params.endpoint} returned non-JSON response: ${String(err)}`);
  }
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

function parseMetric(row: RunReportRow | null | undefined, index: number) {
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

async function fetchActiveUsers(accessToken: string, propertyId: string) {
  try {
    const response = await callGa4Api<RunReportResponse>({
      accessToken,
      propertyId,
      endpoint: "runRealtimeReport",
      body: { metrics: [{ name: "activeUsers" }] },
    });
    return parseMetric(response.rows?.[0], 0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[ga4] Realtime activeUsers unavailable:", message);
    return 0;
  }
}

async function fetchSummary(accessToken: string, propertyId: string, range: Ga4DateRange) {
  const response = await callGa4Api<RunReportResponse>({
    accessToken,
    propertyId,
    endpoint: "runReport",
    body: {
      dateRanges: [rangeToDates(range)],
      metrics: [
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "sessions" },
      ],
    },
  });

  const row = response.rows?.[0];
  return {
    totalUsers: parseMetric(row, 0),
    newUsers: parseMetric(row, 1),
    pageViews: parseMetric(row, 2),
    sessions: parseMetric(row, 3),
  };
}

async function fetchTimeSeries(accessToken: string, propertyId: string, range: Ga4DateRange) {
  const dimensionName = range === "today" ? "hour" : range === "12m" ? "yearMonth" : "date";

  const response = await callGa4Api<RunReportResponse>({
    accessToken,
    propertyId,
    endpoint: "runReport",
    body: {
      dateRanges: [rangeToDates(range)],
      dimensions: [{ name: dimensionName }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName } }],
    },
  });

  return (response.rows ?? []).map((row) => ({
    date: formatGaDate(row.dimensionValues?.[0]?.value ?? ""),
    users: parseMetric(row, 0),
    pageViews: parseMetric(row, 1),
    sessions: parseMetric(row, 2),
  }));
}

async function fetchBreakdown(
  accessToken: string,
  propertyId: string,
  range: Ga4DateRange,
  dimensionName: string,
  limit = 8,
): Promise<Ga4BreakdownItem[]> {
  const response = await callGa4Api<RunReportResponse>({
    accessToken,
    propertyId,
    endpoint: "runReport",
    body: {
      dateRanges: [rangeToDates(range)],
      dimensions: [{ name: dimensionName }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    },
  });

  const items = (response.rows ?? []).map((row) => ({
    label: row.dimensionValues?.[0]?.value || "(not set)",
    users: parseMetric(row, 0),
    share: 0,
  }));

  return withShares(items).map(({ label, users, share }) => ({ label, users, share }));
}

async function fetchTopPages(
  accessToken: string,
  propertyId: string,
  range: Ga4DateRange,
): Promise<Ga4PageItem[]> {
  const response = await callGa4Api<RunReportResponse>({
    accessToken,
    propertyId,
    endpoint: "runReport",
    body: {
      dateRanges: [rangeToDates(range)],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    },
  });

  const items = (response.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value || "/",
    views: parseMetric(row, 0),
    share: 0,
  }));

  return withViewShares(items);
}

function classifyGa4Error(
  message: string,
  propertyId: string,
  clientEmail: string,
): string | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("permission_denied") || lower.includes("permission denied")) {
    return `Grant the service account ${clientEmail} Viewer access on GA4 property ${propertyId} (GA4 Admin → Property → Property Access Management).`;
  }
  if (lower.includes("not_found") || lower.includes("does not exist")) {
    return `GA4 property ${propertyId} was not found. Verify the numeric Property ID in GA4 Admin → Property settings.`;
  }
  if (lower.includes("invalid_grant") || lower.includes("invalid jwt signature")) {
    return "The service account credentials are invalid. Re-download the JSON key and update GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY (with \\n preserved).";
  }
  if (lower.includes("unauthenticated") || lower.includes("authentication")) {
    return "Google rejected the service account authentication. Check GOOGLE_PRIVATE_KEY formatting.";
  }
  if (lower.includes("api has not been used") || lower.includes("analyticsdata.googleapis.com")) {
    return "Enable the Google Analytics Data API in the Google Cloud project.";
  }
  return undefined;
}

export async function getGa4Analytics(range: Ga4DateRange): Promise<Ga4AnalyticsResult> {
  try {
    const cacheKey = range;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return { ok: true, data: cached.data };
    }

    const config = getGa4Credentials();
    if ("error" in config) {
      return { ok: false, error: config.error, details: config.details };
    }

    const { propertyId, clientEmail, privateKey } = config;

    let accessToken: string;
    try {
      accessToken = await fetchAccessToken(clientEmail, privateKey);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return ga4Failure(err, classifyGa4Error(message, propertyId, clientEmail));
    }

    console.info("[ga4] Fetching analytics for property", propertyId, "range", range);

    let activeUsers: number;
    let summary: Awaited<ReturnType<typeof fetchSummary>>;
    let timeSeries: Awaited<ReturnType<typeof fetchTimeSeries>>;
    let topPages: Ga4PageItem[];
    let trafficSources: Ga4BreakdownItem[];
    let devices: Ga4BreakdownItem[];
    let countries: Ga4BreakdownItem[];

    try {
      [activeUsers, summary, timeSeries, topPages, trafficSources, devices, countries] =
        await Promise.all([
          fetchActiveUsers(accessToken, propertyId),
          fetchSummary(accessToken, propertyId, range),
          fetchTimeSeries(accessToken, propertyId, range),
          fetchTopPages(accessToken, propertyId, range),
          fetchBreakdown(accessToken, propertyId, range, "sessionDefaultChannelGroup"),
          fetchBreakdown(accessToken, propertyId, range, "deviceCategory"),
          fetchBreakdown(accessToken, propertyId, range, "country"),
        ]);
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : String(apiError);
      return ga4Failure(apiError, classifyGa4Error(message, propertyId, clientEmail));
    }

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
    return { ok: true, data };
  } catch (error) {
    return ga4Failure(error);
  }
}
