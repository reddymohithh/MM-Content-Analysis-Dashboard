import type { ReactNode } from "react";

export function PageTitle({
  title,
  caption,
}: {
  title: string;
  caption?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="font-serif text-[20px] font-semibold">{title}</h1>
      {caption && <p className="mt-1 text-[13px] text-text-muted">{caption}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
        {label}
      </div>
      <div className="mt-1.5 font-serif text-[26px] font-semibold">{value}</div>
      {sub && <div className="mt-1 text-[11.5px] text-text-muted">{sub}</div>}
    </div>
  );
}

export function GradientStatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 text-ink"
      style={{ background: "linear-gradient(135deg,#FF5500,#FFB800)" }}
    >
      <div className="font-mono text-[10.5px] uppercase tracking-wide">{label}</div>
      <div className="mt-1.5 font-serif text-[26px] font-bold">{value}</div>
      {sub && <div className="mt-1 text-[11.5px]">{sub}</div>}
    </div>
  );
}

export function Card({
  children,
  soft = false,
  className = "",
}: {
  children: ReactNode;
  soft?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[10px] border border-border p-4 ${
        soft ? "bg-card-soft" : "bg-card"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-heading-soft">
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center py-6 text-center text-[12px] text-text-faint">
      {children}
    </div>
  );
}

export function DataTable({
  columns,
  children,
}: {
  columns: { label: string; align?: "left" | "right" }[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-card">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-card-soft">
            {columns.map((col) => (
              <th
                key={col.label}
                className={`px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-wide text-text-muted ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
