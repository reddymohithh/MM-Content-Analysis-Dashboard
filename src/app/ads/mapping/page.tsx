import { MappingBuilder } from "@/components/ads/MappingBuilder";
import {
  getCampaignsWithChildren,
  getBeehiivSegmentOptions,
  getMappingsWithNames,
  getAdDailyMetricRows,
} from "@/lib/ads/data";

export const dynamic = "force-dynamic";

export default async function AdsMappingPage() {
  const [campaigns, segments, mappings, dailyMetrics] = await Promise.all([
    getCampaignsWithChildren(),
    getBeehiivSegmentOptions(),
    getMappingsWithNames(),
    getAdDailyMetricRows(),
  ]);

  return (
    <MappingBuilder campaigns={campaigns} segments={segments} mappings={mappings} dailyMetrics={dailyMetrics} />
  );
}
