import { cookies } from "next/headers";
import { Suspense } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { SITE_AUTH_COOKIE, computeSiteAuthToken } from "@/lib/site-auth";

// If no SITE_PASSWORD is configured, the gate is off (see proxy.ts) and
// "logged in/out" isn't a meaningful concept — the navbar shows neither
// button rather than one that wouldn't do anything.
async function getAuthButton(): Promise<"login" | "logout" | null> {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SITE_AUTH_COOKIE)?.value;
  const expected = await computeSiteAuthToken(password);
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
