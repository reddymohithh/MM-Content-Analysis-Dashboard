import { AdsDashboard } from "@/components/ads/AdsDashboard";
import {
  getCampaignsWithChildren,
  getAdDailyMetricRows,
  getAdDailyPlatformMetricRows,
  getMappingsForLookup,
  getBeehiivSegmentOptions,
  getBeehiivMetaSourceTotal,
} from "@/lib/ads/data";

export const dynamic = "force-dynamic";

export default async function AdsOverviewPage() {
  const [campaigns, dailyMetrics, dailyPlatformMetrics, mappings, segments, beehiivFallback] =
    await Promise.all([
      getCampaignsWithChildren(),
      getAdDailyMetricRows(),
      getAdDailyPlatformMetricRows(),
      getMappingsForLookup(),
      getBeehiivSegmentOptions(),
      getBeehiivMetaSourceTotal(),
    ]);

  return (
    <AdsDashboard
      campaigns={campaigns}
      dailyMetrics={dailyMetrics}
      dailyPlatformMetrics={dailyPlatformMetrics}
      mappings={mappings}
      segments={segments}
      beehiivFallback={beehiivFallback}
    />
  );
}
