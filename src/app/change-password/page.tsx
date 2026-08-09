import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  "wrong-current": "That current password isn't right.",
  "too-short": "New password must be at least 4 characters.",
};

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <div className="mb-4 font-serif text-[19px] font-semibold">
          Marketing Monk<span className="text-orange">.</span>
        </div>
        <p className="mb-4 text-[13px] text-text-muted">
          Change the shared dashboard password. Everyone with the old
          password will be signed out next time the gate checks in (up to a
          minute).
        </p>
        <form method="POST" action="/api/site-auth/change-password" className="space-y-3">
          <input
            type="password"
            name="currentPassword"
            autoFocus
            placeholder="Current password"
            className="w-full rounded-lg border border-border bg-card-soft px-3 py-2 text-[13px] outline-none focus:border-orange"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            className="w-full rounded-lg border border-border bg-card-soft px-3 py-2 text-[13px] outline-none focus:border-orange"
          />
          {errorMessage && <p className="text-[12px] text-negative">{errorMessage}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-orange px-3 py-2 text-[13px] font-semibold text-ink"
          >
            Update password
          </button>
        </form>
        <Link
          href="/overview"
          className="mt-3 block text-center text-[12px] text-text-muted no-underline hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
