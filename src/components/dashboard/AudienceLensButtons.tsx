"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LENSES = [
  { value: "blended", label: "Blended" },
  { value: "batch1", label: "Batch 1" },
  { value: "batch2", label: "Batch 2" },
] as const;

export function AudienceLensButtons() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const audience = searchParams.get("audience") ?? "blended";

  function setAudience(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("audience", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-shrink-0 items-center gap-1 rounded-[9px] bg-lens-bg p-1">
      {LENSES.map((lens) => (
        <button
          key={lens.value}
          type="button"
          onClick={() => setAudience(lens.value)}
          className={`whitespace-nowrap flex-shrink-0 rounded-lg px-3 py-1 text-[12.5px] font-medium transition-colors ${
            audience === lens.value ? "bg-orange text-ink" : "text-text-faint"
          }`}
        >
          {lens.label}
        </button>
      ))}
    </div>
  );
}
