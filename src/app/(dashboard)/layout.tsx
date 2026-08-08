import { Suspense } from "react";
import { Navbar } from "@/components/dashboard/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-cream">
      <Suspense fallback={<div className="h-[57px] flex-shrink-0 bg-ink" />}>
        <Navbar />
      </Suspense>
      <div className="flex-1 overflow-y-auto px-8 py-5">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </div>
    </div>
  );
}
