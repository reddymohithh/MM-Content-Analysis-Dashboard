/** Small pure helpers shared by the ads dashboard's KPI cards and table. */

export function costPerLead(spend: number, leads: number): number | null {
  return leads > 0 ? spend / leads : null;
}

/** The number this whole feature exists to compute: real cost per real
 * subscriber, not Meta's self-reported cost per lead. */
export function acquisitionCost(spend: number, subscribers: number | null): number | null {
  return subscribers && subscribers > 0 ? spend / subscribers : null;
}
