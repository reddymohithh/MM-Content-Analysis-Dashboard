export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <div className="mb-4 font-serif text-[19px] font-semibold">
          Marketing Monk<span className="text-orange">.</span>
        </div>
        <p className="mb-4 text-[13px] text-text-muted">
          This dashboard is a private demo. Enter the password to continue.
        </p>
        <form method="POST" action="/api/site-auth" className="space-y-3">
          <input type="hidden" name="next" value={next ?? "/overview"} />
          <input
            type="password"
            name="password"
            autoFocus
            placeholder="Password"
            className="w-full rounded-lg border border-border bg-card-soft px-3 py-2 text-[13px] outline-none focus:border-orange"
          />
          {error && (
            <p className="text-[12px] text-negative">That password isn&apos;t right.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-orange px-3 py-2 text-[13px] font-semibold text-ink"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
