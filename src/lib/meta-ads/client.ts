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
}

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  adset_id: string;
  campaign_id: string;
  created_time: string;
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
    fields: "id,name,status,campaign_id,created_time",
  });
}

export async function listAds(): Promise<MetaAd[]> {
  return metaFetchAll<MetaAd>(`/act_${adAccountId()}/ads`, {
    fields: "id,name,status,adset_id,campaign_id,created_time",
  });
}
