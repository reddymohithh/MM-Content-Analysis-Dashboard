import { Suspense } from "react";
import { AdsNavbar } from "@/components/ads/AdsNavbar";
import { getAuthButtonState } from "@/lib/site-auth";

export default async function AdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authButton = await getAuthButtonState();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-cream">
      <Suspense fallback={<div className="h-[57px] flex-shrink-0 bg-ink" />}>
        <AdsNavbar authButton={authButton} />
      </Suspense>
      <div className="flex-1 overflow-y-auto px-12 py-5">{children}</div>
    </div>
  );
}
