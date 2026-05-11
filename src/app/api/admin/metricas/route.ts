import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GA4_PROPERTY_ID = "532553446";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GA4Row {
  dimensionValues?: Array<{ value: string }>;
  metricValues?: Array<{ value: string }>;
}

interface GA4ReportResponse {
  rows?: GA4Row[];
}

// ── JWT / OAuth helpers ───────────────────────────────────────────────────────

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getServiceAccountToken(): Promise<string> {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GA4_SERVICE_ACCOUNT_JSON env var not set");
  const creds = JSON.parse(raw) as { client_email: string; private_key: string };

  const header = b64url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(
    Buffer.from(
      JSON.stringify({
        iss: creds.client_email,
        scope: "https://www.googleapis.com/auth/analytics.readonly",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
      })
    )
  );

  const signingInput = `${header}.${payload}`;
  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  sign.end();
  const signature = b64url(sign.sign(creds.private_key));

  const jwt = `${signingInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
  const td = await tokenRes.json() as { access_token: string };
  return td.access_token;
}

// ── GA4 report helper ─────────────────────────────────────────────────────────

async function runReport(token: string, body: object): Promise<GA4ReportResponse> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`GA4 error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<GA4ReportResponse>;
}

function firstRowMetric(report: GA4ReportResponse | null, idx: number): number {
  if (!report?.rows?.length) return 0;
  return parseInt(report.rows[0]?.metricValues?.[idx]?.value ?? "0", 10);
}

function firstRowFloat(report: GA4ReportResponse | null, idx: number): number {
  if (!report?.rows?.length) return 0;
  return parseFloat(report.rows[0]?.metricValues?.[idx]?.value ?? "0");
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const token = await getServiceAccountToken();

    const [todayR, weekR, monthR, topPagesR, sourcesR, trendR] = await Promise.all([
      runReport(token, {
        dateRanges: [{ startDate: "today", endDate: "today" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      }).catch(() => null),
      runReport(token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }).catch(() => null),
      runReport(token, {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "newUsers" },
        ],
      }).catch(() => null),
      runReport(token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }).catch(() => null),
      runReport(token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGrouping" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }).catch(() => null),
      runReport(token, {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }).catch(() => null),
    ]);

    return NextResponse.json({
      today: {
        users: firstRowMetric(todayR, 0),
        sessions: firstRowMetric(todayR, 1),
        pageviews: firstRowMetric(todayR, 2),
      },
      week: {
        users: firstRowMetric(weekR, 0),
        sessions: firstRowMetric(weekR, 1),
        pageviews: firstRowMetric(weekR, 2),
        bounceRate: Math.round(firstRowFloat(weekR, 3) * 100),
        avgSessionDuration: Math.round(firstRowFloat(weekR, 4)),
      },
      month: {
        users: firstRowMetric(monthR, 0),
        sessions: firstRowMetric(monthR, 1),
        pageviews: firstRowMetric(monthR, 2),
        newUsers: firstRowMetric(monthR, 3),
      },
      topPages: (topPagesR?.rows ?? []).map((row) => ({
        path: row.dimensionValues?.[0]?.value ?? "",
        title: row.dimensionValues?.[1]?.value ?? "",
        views: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
        users: parseInt(row.metricValues?.[1]?.value ?? "0", 10),
      })),
      sources: (sourcesR?.rows ?? []).map((row) => ({
        channel: row.dimensionValues?.[0]?.value ?? "",
        sessions: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
        users: parseInt(row.metricValues?.[1]?.value ?? "0", 10),
      })),
      trend: (trendR?.rows ?? []).map((row) => ({
        date: row.dimensionValues?.[0]?.value ?? "",
        users: parseInt(row.metricValues?.[0]?.value ?? "0", 10),
        sessions: parseInt(row.metricValues?.[1]?.value ?? "0", 10),
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("GA4 metrics error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
