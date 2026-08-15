import { PageTitle } from "@/components/dashboard/ui";
import { MappingBuilder } from "@/components/ads/MappingBuilder";
import { getCampaignsWithChildren, getBeehiivSegmentOptions, getMappingsWithNames } from "@/lib/ads/data";

export const dynamic = "force-dynamic";

export default async function AdsMappingPage() {
  const [campaigns, segments, mappings] = await Promise.all([
    getCampaignsWithChildren(),
    getBeehiivSegmentOptions(),
    getMappingsWithNames(),
  ]);

  return (
    <div>
      <div className="mx-auto max-w-[1120px]">
        <PageTitle
          title="Campaign mapping"
          caption="Connect Meta ad sets and ads to the Beehiiv segments that track their real subscribers."
        />
      </div>
      <MappingBuilder campaigns={campaigns} segments={segments} mappings={mappings} />
    </div>
  );
}
