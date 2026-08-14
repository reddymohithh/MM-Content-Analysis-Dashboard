import { PageTitle, Card, Eyebrow, EmptyState } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default function AdsOverviewPage() {
  return (
    <div className="mx-auto max-w-[1120px]">
      <PageTitle
        title="Ads"
        caption="Meta Ads and SparkLoop spend, cross-referenced against real Beehiiv subscriber outcomes."
      />

      <Card>
        <Eyebrow>Status</Eyebrow>
        <EmptyState>
          <div className="max-w-md space-y-2">
            <p>
              Nothing fetched yet. The Meta Ads ↔ Beehiiv comparison
              (campaign spend, leads, and cost per lead against real
              subscriber counts, open rate, and CTR from matching Beehiiv
              segments) is next up.
            </p>
            <p>
              SparkLoop is on hold until v3 API access is granted for this
              account — the currently-available v2 API doesn&apos;t expose
              campaign-level cost or referral data.
            </p>
          </div>
        </EmptyState>
      </Card>
    </div>
  );
}
