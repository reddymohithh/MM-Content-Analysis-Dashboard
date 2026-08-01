/**
 * USA date formatting, ported from the wireframe's `usDate()`: no leading
 * zeros (built via unary-plus on each ISO part), `M/D` or `M/D/YYYY`.
 */
export function usDate(iso: string | Date, withYear = false): string {
  const date = typeof iso === "string" ? iso : iso.toISOString().slice(0, 10);
  const [y, m, d] = date.slice(0, 10).split("-");
  return withYear ? `${+m}/${+d}/${y}` : `${+m}/${+d}`;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
