/**
 * Shape the ads dashboard UI is built against. Not backed by a real table
 * yet — the Meta Ads client, the Beehiiv cross-reference, and the Fetch
 * trigger are the next round (see BUILD_LOG.md). This round is layout
 * only, so every page/component here renders correctly with an empty
 * array rather than faked numbers.
 */

export interface AdCampaignRow {
  id: string;
  name: string;
  country: string;
  /** Manually-mapped Beehiiv utm_medium for this campaign, or null if
   * nobody has connected it yet (see Round 33's "manual mapping" decision). */
  beehiivUtmMedium: string | null;

  spend: number;
  metaLeads: number;
  impressions: number;
  linkClicks: number;

  /** null until a Beehiiv segment is mapped and fetched. */
  beehiivSubscribers: number | null;
  beehiivOpenRate: number | null;
  beehiivClickThroughRate: number | null;
}

export interface AdDailyPoint {
  date: string; // YYYY-MM-DD
  spend: number;
  metaLeads: number;
  beehiivSubscribers: number | null;
}

export function metaCostPerLead(row: AdCampaignRow): number | null {
  return row.metaLeads > 0 ? row.spend / row.metaLeads : null;
}

/** The number this whole feature exists to compute: real cost per real
 * subscriber, not Meta's self-reported cost per lead. */
export function trueAcquisitionCost(row: AdCampaignRow): number | null {
  return row.beehiivSubscribers && row.beehiivSubscribers > 0
    ? row.spend / row.beehiivSubscribers
    : null;
}

export function ctr(impressions: number, clicks: number): number | null {
  return impressions > 0 ? (clicks / impressions) * 100 : null;
}
