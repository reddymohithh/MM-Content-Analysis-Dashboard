import Link from "next/link";

export const dynamic = "force-dynamic";

export default function RootPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-cream px-4">
      <div className="font-serif text-[24px] font-semibold">
        Marketing Monk<span className="text-orange">.</span>
      </div>
      <div className="grid w-full max-w-lg grid-cols-2 gap-4">
        <Link
          href="/overview"
          className="rounded-xl border border-border bg-card p-6 no-underline transition-colors hover:border-orange"
        >
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
            Content
          </div>
          <div className="mt-1.5 font-serif text-[19px] font-semibold text-ink">
            Content Dashboard
          </div>
          <p className="mt-1.5 text-[12.5px] text-text-muted">
            Editions, subject lines, retention, and editorial content
            quality.
          </p>
        </Link>
        <Link
          href="/ads"
          className="rounded-xl border border-border bg-card p-6 no-underline transition-colors hover:border-orange"
        >
          <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
            Ads
          </div>
          <div className="mt-1.5 font-serif text-[19px] font-semibold text-ink">
            Ads Dashboard
          </div>
          <p className="mt-1.5 text-[12.5px] text-text-muted">
            Meta Ads and SparkLoop spend vs. real Beehiiv subscriber
            outcomes.
          </p>
        </Link>
      </div>
    </div>
  );
}
