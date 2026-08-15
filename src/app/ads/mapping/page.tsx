import { MappingBuilder } from "@/components/ads/MappingBuilder";
import { getCampaignsWithChildren, getBeehiivSegmentOptions, getMappingsWithNames } from "@/lib/ads/data";

export const dynamic = "force-dynamic";

export default async function AdsMappingPage() {
  const [campaigns, segments, mappings] = await Promise.all([
    getCampaignsWithChildren(),
    getBeehiivSegmentOptions(),
    getMappingsWithNames(),
  ]);

  return <MappingBuilder campaigns={campaigns} segments={segments} mappings={mappings} />;
}
