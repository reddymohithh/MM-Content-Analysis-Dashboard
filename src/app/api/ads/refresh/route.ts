import { NextResponse } from "next/server";
import { syncMetaAdsData } from "@/lib/meta-ads/sync";
import { syncBeehiivSegments } from "@/lib/beehiiv/segments-sync";

export const maxDuration = 300;

/**
 * Manually-triggered by the ads dashboard navbar's "Refresh" button.
 * Syncs both sides the mapping page needs: Meta campaigns/ad sets/ads,
 * and the Beehiiv segments cache. The two are independent — Meta isn't
 * configured yet (BUILD_LOG.md), but that shouldn't block refreshing
 * Beehiiv segments, which is fully available. Each side reports its own
 * error rather than one missing credential failing the whole request.
 */
export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not set. Nothing to sync into." },
      { status: 400 },
    );
  }

  const result: {
    campaigns?: number;
    adSets?: number;
    ads?: number;
    segments?: number;
    errors: string[];
  } = { errors: [] };

  if (!process.env.META_ACCESS_TOKEN || !process.env.META_AD_ACCOUNT_ID) {
    result.errors.push("Meta: META_ACCESS_TOKEN or META_AD_ACCOUNT_ID is not set.");
  } else {
    try {
      const meta = await syncMetaAdsData();
      result.campaigns = meta.campaigns;
      result.adSets = meta.adSets;
      result.ads = meta.ads;
    } catch (err) {
      result.errors.push(`Meta: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (!process.env.BEEHIIV_API_KEY || !process.env.BEEHIIV_PUBLICATION_ID) {
    result.errors.push("Beehiiv: BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID is not set.");
  } else {
    try {
      const segments = await syncBeehiivSegments();
      result.segments = segments.segments;
    } catch (err) {
      result.errors.push(`Beehiiv: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const status = result.campaigns === undefined && result.segments === undefined ? 500 : 200;
  return NextResponse.json(result, { status });
}
