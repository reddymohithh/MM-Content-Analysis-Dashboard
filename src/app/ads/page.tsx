import { AdsDashboard } from "@/components/ads/AdsDashboard";
import {
  getCampaignsWithChildren,
  getAdDailyMetricRows,
  getMappingsForLookup,
  getBeehiivSegmentOptions,
  getBeehiivMetaSourceTotal,
} from "@/lib/ads/data";

export const dynamic = "force-dynamic";

export default async function AdsOverviewPage() {
  const [campaigns, dailyMetrics, mappings, segments, beehiivFallback] = await Promise.all([
    getCampaignsWithChildren(),
    getAdDailyMetricRows(),
    getMappingsForLookup(),
    getBeehiivSegmentOptions(),
    getBeehiivMetaSourceTotal(),
  ]);

  return (
    <AdsDashboard
      campaigns={campaigns}
      dailyMetrics={dailyMetrics}
      mappings={mappings}
      segments={segments}
      beehiivFallback={beehiivFallback}
    />
  );
}
