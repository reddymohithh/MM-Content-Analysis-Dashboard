import { CampaignsBrowser } from "@/components/ads/CampaignsBrowser";
import { getCampaignsWithChildren } from "@/lib/ads/data";

export const dynamic = "force-dynamic";

export default async function AdsCampaignsPage() {
  const campaigns = await getCampaignsWithChildren();
  return <CampaignsBrowser campaigns={campaigns} />;
}
