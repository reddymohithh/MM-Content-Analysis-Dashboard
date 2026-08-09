import { cookies } from "next/headers";
import { Suspense } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { SITE_AUTH_COOKIE, getCurrentAuthToken } from "@/lib/site-auth";

// If the gate is fully off (see proxy.ts — no password set via env var or
// change-password, ever), "logged in/out" isn't a meaningful concept — the
// navbar shows neither button rather than one that wouldn't do anything.
async function getAuthButton(): Promise<"login" | "logout" | null> {
  const expected = await getCurrentAuthToken();
  if (expected === null) return null;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SITE_AUTH_COOKIE)?.value;
  return cookie === expected ? "logout" : "login";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authButton = await getAuthButton();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-cream">
      <Suspense fallback={<div className="h-[57px] flex-shrink-0 bg-ink" />}>
        <Navbar authButton={authButton} />
      </Suspense>
      <div className="flex-1 overflow-y-auto px-12 py-5">{children}</div>
    </div>
  );
}
