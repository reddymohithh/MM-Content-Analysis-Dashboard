/**
 * Meta Marketing API (Graph API) client — direct REST calls, not the Ads
 * MCP used during BUILD_LOG.md Round 33's research. The MCP only exists
 * inside a chat session; the deployed app needs its own long-lived access
 * token, the same pattern as BEEHIIV_API_KEY.
 *
 * Pinned to v25.0 (current as of this build; v26.0 shipped 2026-07-29 but
 * has documented placement-field quirks, v23.0 hit end-of-life 2026-06-09
 * — v25.0 is the newest version without either problem). Bump the version
 * string below when v25.0 approaches its own sunset.
 */

const API_VERSION = "v25.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Copy .env.example to .env.local and fill it in.`);
  }
  return value;
}

async function metaFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const token = requireEnv("META_ACCESS_TOKEN");
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("access_token", token);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Meta Ads API error ${res.status} on ${path}: ${body}`);
  }
  return res.json() as Promise<T>;
}

interface GraphPage<T> {
  data: T[];
  paging?: { cursors?: { after?: string }; next?: string };
}

/** Meta paginates via opaque `after` cursors, not offset/limit — walks
 * every page rather than assuming everything fits in one response. */
async function metaFetchAll<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T[]> {
  const results: T[] = [];
  let after: string | undefined;
  for (;;) {
    const page = await metaFetch<GraphPage<T>>(path, { ...params, after, limit: 100 });
    results.push(...page.data);
    after = page.paging?.cursors?.after;
    if (!after || !page.paging?.next) break;
  }
  return results;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective?: string;
  created_time: string; // ISO 8601
}

export interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  created_time: string;
  /** Present only when placements are manually restricted; Meta omits
   * this key entirely for Advantage+/Automatic placements (confirmed
   * live, BUILD_LOG.md Round 49). */
  targeting?: { publisher_platforms?: string[] };
}

/** "advantage" when Meta is choosing placements automatically (no
 * `publisher_platforms` in targeting), "manual" when the ad set
 * restricts to specific platforms. */
export function placementStrategyOf(adSet: MetaAdSet): "advantage" | "manual" {
  return adSet.targeting?.publisher_platforms && adSet.targeting.publisher_platforms.length > 0
    ? "manual"
    : "advantage";
}

export interface MetaAdCreative {
  title?: string;
  body?: string;
  image_url?: string;
  thumbnail_url?: string;
  video_id?: string;
  call_to_action_type?: string;
}

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  campaign_id: string;
  created_time: string;
  creative?: MetaAdCreative;
}

function adAccountId(): string {
  return requireEnv("META_AD_ACCOUNT_ID");
}

export async function listCampaigns(): Promise<MetaCampaign[]> {
  return metaFetchAll<MetaCampaign>(`/act_${adAccountId()}/campaigns`, {
    fields: "id,name,status,objective,created_time",
  });
}

export async function listAdSets(): Promise<MetaAdSet[]> {
  return metaFetchAll<MetaAdSet>(`/act_${adAccountId()}/adsets`, {
    fields: "id,name,status,campaign_id,created_time,targeting{publisher_platforms}",
  });
}

/**
 * `creative{...}` is a Graph API field-expansion, not a separate endpoint
 * (confirmed against the account via the Ads MCP in Round 43) -- pulling
 * it here means the ad copy and image/video sync in the same paginated
 * call as everything else, no per-ad round trip.
 */
export async function listAds(): Promise<MetaAd[]> {
  return metaFetchAll<MetaAd>(`/act_${adAccountId()}/ads`, {
    fields:
      "id,name,status,adset_id,campaign_id,created_time,creative{title,body,image_url,thumbnail_url,video_id,call_to_action_type}",
  });
}

export interface MetaAdDailyMetric {
  adId: string;
  date: string; // YYYY-MM-DD
  spend: number;
  leads: number;
  impressions: number;
  linkClicks: number;
  frequency: number;
}

interface InsightsRow {
  ad_id?: string;
  date_start?: string;
  spend?: string;
  impressions?: string;
  inline_link_clicks?: string;
  frequency?: string;
  actions?: { action_type: string; value: string }[];
  publisher_platform?: string;
}

/**
 * Per-ad, per-day rows (level=ad, time_increment=1) for the Overview
 * dashboard's date-range and Campaign/Ad set/Ad filters, which need real
 * daily granularity rather than one account-wide lifetime figure
 * (BUILD_LOG.md Round 41). Same `actions` array parsing as before —
 * `lead` isn't a queryable field on the raw Insights endpoint, only an
 * MCP convenience, so it's picked out of `actions` by action_type.
 * `frequency` is Meta's own single-day figure (Round 49) — CPM/CPC
 * aren't fetched here since they're cleanly derivable from spend/
 * impressions/linkClicks already returned.
 */
export async function getAdDailyMetrics(datePreset = "last_90d"): Promise<MetaAdDailyMetric[]> {
  const rows = await metaFetchAll<InsightsRow>(`/act_${adAccountId()}/insights`, {
    level: "ad",
    time_increment: 1,
    fields: "ad_id,spend,impressions,inline_link_clicks,frequency,actions",
    date_preset: datePreset,
  });
  return rows
    .filter((row) => row.ad_id && row.date_start)
    .map((row) => {
      const leadAction = row.actions?.find((a) => a.action_type === "lead");
      return {
        adId: row.ad_id as string,
        date: row.date_start as string,
        spend: row.spend ? parseFloat(row.spend) : 0,
        leads: leadAction ? parseInt(leadAction.value, 10) : 0,
        impressions: row.impressions ? parseInt(row.impressions, 10) : 0,
        linkClicks: row.inline_link_clicks ? parseInt(row.inline_link_clicks, 10) : 0,
        frequency: row.frequency ? parseFloat(row.frequency) : 0,
      };
    });
}

export interface MetaAdDailyPlatformMetric {
  adId: string;
  date: string; // YYYY-MM-DD
  platform: string; // Meta's publisher_platform value, e.g. "facebook"
  spend: number;
  leads: number;
  impressions: number;
  linkClicks: number;
}

/**
 * Same per-ad-per-day insights call as getAdDailyMetrics(), but broken
 * down by `publisher_platform` (Round 49) -- Facebook vs Instagram vs
 * Threads vs Audience Network vs Messenger. A genuinely different,
 * finer-grained result shape (multiple rows per ad-day, one per
 * platform actually delivered on), which is why this is a separate
 * call and a separate table rather than folded into
 * getAdDailyMetrics().
 */
export async function getAdDailyPlatformMetrics(
  datePreset = "last_90d",
): Promise<MetaAdDailyPlatformMetric[]> {
  const rows = await metaFetchAll<InsightsRow>(`/act_${adAccountId()}/insights`, {
    level: "ad",
    time_increment: 1,
    fields: "ad_id,spend,impressions,inline_link_clicks,actions",
    breakdowns: "publisher_platform",
    date_preset: datePreset,
  });
  return rows
    .filter((row) => row.ad_id && row.date_start && row.publisher_platform)
    .map((row) => {
      const leadAction = row.actions?.find((a) => a.action_type === "lead");
      return {
        adId: row.ad_id as string,
        date: row.date_start as string,
        platform: row.publisher_platform as string,
        spend: row.spend ? parseFloat(row.spend) : 0,
        leads: leadAction ? parseInt(leadAction.value, 10) : 0,
        impressions: row.impressions ? parseInt(row.impressions, 10) : 0,
        linkClicks: row.inline_link_clicks ? parseInt(row.inline_link_clicks, 10) : 0,
      };
    });
}
