"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "running" | "done" | "error";

export function ContentQualityRefreshButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function runRefresh() {
    setStatus("running");
    setMessage(null);
    try {
      const res = await fetch("/api/content-quality/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Refresh failed.");
        return;
      }
      setStatus("done");
      setMessage(
        data.scored > 0
          ? `Scored ${data.scored} edition${data.scored === 1 ? "" : "s"}${
              data.errors?.length ? `, ${data.errors.length} failed` : ""
            }.`
          : "All editions already scored.",
      );
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Refresh failed — check the server logs.");
    }
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={runRefresh}
        disabled={status === "running"}
        className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-text-faint/40 px-3 py-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-cream disabled:opacity-50"
        title="Analyze new editions for content quality (requires local API keys)"
      >
        <span className={status === "running" ? "inline-block animate-spin" : "inline-block"}>
          ↻
        </span>
        {status === "running" ? "Analyzing…" : "Analyze content"}
      </button>
      {message && (
        <div
          className={`absolute right-0 top-full z-20 mt-1.5 w-56 rounded-lg border px-3 py-2 text-[11.5px] shadow-lg ${
            status === "error"
              ? "border-negative bg-card text-negative"
              : "border-border bg-card text-ink"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
