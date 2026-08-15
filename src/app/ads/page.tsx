import { PageTitle } from "@/components/dashboard/ui";
import { AdsDashboard } from "@/components/ads/AdsDashboard";
import { getMetaTotals, getBeehiivMetaSourceTotal } from "@/lib/ads/data";
import type { AdCampaignRow } from "@/lib/ads/types";

export const dynamic = "force-dynamic";

// Per-campaign metrics aren't wired up yet -- the campaign table stays an
// honest empty state until that's built. The account-wide totals above
// it (metaTotals / beehiivMetaSubscribers) are real, from the database.
const campaigns: AdCampaignRow[] = [];

export default async function AdsOverviewPage() {
  const [metaTotals, beehiivMetaSubscribers] = await Promise.all([
    getMetaTotals(),
    getBeehiivMetaSourceTotal(),
  ]);

  return (
    <div>
      <div className="mx-auto max-w-[1120px]">
        <PageTitle
          title="Ads"
          caption="Meta Ads spend, cross-referenced against real Beehiiv subscriber outcomes. SparkLoop joins once v3 API access is granted."
        />
      </div>
      <AdsDashboard
        campaigns={campaigns}
        metaTotals={metaTotals}
        beehiivMetaSubscribers={beehiivMetaSubscribers}
      />
    </div>
  );
}
