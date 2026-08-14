import { Suspense } from "react";
import { Navbar } from "@/components/dashboard/Navbar";

const ERROR_MESSAGES: Record<string, string> = {
  username: "Enter a username.",
  password: "That password isn't right.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.password) : null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <Suspense fallback={<div className="h-[57px] flex-shrink-0 bg-ink" />}>
        <Navbar disabled />
      </Suspense>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
          <div className="mb-4 font-serif text-[19px] font-semibold">
            Marketing Monk<span className="text-orange">.</span>
          </div>
          <form method="POST" action="/api/site-auth" className="space-y-3">
            <input type="hidden" name="next" value={next ?? "/"} />
            <input
              type="text"
              name="username"
              autoFocus
              autoComplete="username"
              placeholder="Username"
              className="w-full rounded-lg border border-border bg-card-soft px-3 py-2 text-[13px] outline-none focus:border-orange"
            />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-lg border border-border bg-card-soft px-3 py-2 text-[13px] outline-none focus:border-orange"
            />
            {errorMessage && <p className="text-[12px] text-negative">{errorMessage}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-orange px-3 py-2 text-[13px] font-semibold text-ink"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
