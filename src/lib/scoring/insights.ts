/**
 * Rule-based insight generation: per-edition audience tips (ported verbatim
 * from the wireframe's `generateTips`), plus trailing-window insight cards
 * (Overview's "Tips for improving open rate/CTR" and the Batch 1/Batch 2
 * feedback cards).
 *
 * All of this is genuinely computed from whatever editions are passed in —
 * never hardcoded copy — but it is still template selection over real
 * numbers, not generated prose. A real Claude-API-backed version of both the
 * per-edition audience-fit judgment and these window-level insight cards is
 * the documented v2 step (see BUILD_LOG.md, "voice-compliance / audience-fit
 * LLM scoring" decision); this is the honest placeholder for v1.
 */

import type { HookType } from "./subject-line";
import { HOOK_TYPE_LABELS } from "./subject-line";
import type { Audience } from "./quality-score";

export type { Audience };

export interface InsightEdition {
  id: string;
  subject: string;
  openRate: number;
  ctrOverall: number;
  unsubRate: number;
  publishedAt: Date;
  hookType: HookType;
  qualityTotal: number;
  qualityWeakestName: string;
}

/** Per-edition, per-audience tips shown on the edition detail page. */
export function generateEditionTips(
  edition: Pick<InsightEdition, "ctrOverall">,
  audience: Audience,
  trailingAvgCtr: number,
): string {
  const strong = edition.ctrOverall >= trailingAvgCtr;

  if (audience === "batch1") {
    return strong
      ? `This lands well for practitioners: the piece hands over something usable today. Keep closing with one concrete, same-day action, the way Marketing Brew closes nearly every item with a one-line "what to do about it."`
      : `Add one same-day action tied to the story. Right now this reads as analysis without a task, closer to Marketing Brew's daily format where almost every item ends on a specific next step.`;
  }
  if (audience === "batch2") {
    return strong
      ? `Good category-signal framing for a leadership reader. Push further by tying the story to a budget or vendor evaluation question, closer to Kevin Indig's Growth Memo.`
      : `This skews tactical for a leadership reader. Reframe the close around a structural or budget question, the way Axios closes marketing pieces on "why it matters" for decision-makers.`;
  }
  return strong
    ? `Overall click rate is ahead of the trailing-window average. The piece gave readers a clear reason to click through.`
    : `Overall click rate trails the trailing-window average. Consider ending on a sharper, more specific reader action.`;
}

export interface HookTypeAverage {
  hookType: HookType;
  label: string;
  count: number;
  avgOpenRate: number;
  avgCtr: number;
}

export function computeHookTypeAverages(editions: InsightEdition[]): HookTypeAverage[] {
  const groups = new Map<HookType, InsightEdition[]>();
  for (const e of editions) {
    const list = groups.get(e.hookType) ?? [];
    list.push(e);
    groups.set(e.hookType, list);
  }
  return Array.from(groups.entries())
    .map(([hookType, list]) => ({
      hookType,
      label: HOOK_TYPE_LABELS[hookType],
      count: list.length,
      avgOpenRate:
        Math.round((list.reduce((s, e) => s + e.openRate, 0) / list.length) * 100) / 100,
      avgCtr: Math.round((list.reduce((s, e) => s + e.ctrOverall, 0) / list.length) * 100) / 100,
    }))
    .sort((a, b) => b.avgOpenRate - a.avgOpenRate);
}

function halves<T>(sorted: T[]): [T[], T[]] {
  const mid = Math.ceil(sorted.length / 2);
  return [sorted.slice(0, mid), sorted.slice(mid)];
}

function avg(list: number[]): number {
  return list.length ? list.reduce((s, n) => s + n, 0) / list.length : 0;
}

/** Overview "Tips for improving open rate" card, two real-computed bullets. */
export function generateOpenRateTips(editions: InsightEdition[]): string[] {
  if (editions.length < 2) return ["Not enough editions in this window yet to surface a pattern."];

  const lowest = [...editions].sort((a, b) => a.openRate - b.openRate)[0];
  const chronological = [...editions].sort(
    (a, b) => a.publishedAt.getTime() - b.publishedAt.getTime(),
  );
  const [earlier, later] = halves(chronological);
  const openTrend = avg(later.map((e) => e.openRate)) - avg(earlier.map((e) => e.openRate));
  const unsubTrend = avg(later.map((e) => e.unsubRate)) - avg(earlier.map((e) => e.unsubRate));

  const tips: string[] = [
    `The lowest open rate in this window (${lowest.openRate}% on "${lowest.subject}") also scored lowest on ${lowest.qualityWeakestName.toLowerCase()}, not the poll alone.`,
  ];

  if (openTrend < 0 && unsubTrend <= 0) {
    tips.push(
      "Unsubscribe rate has held steady or improved even as open rate slid, so this looks like a send-time or inbox-placement question first, not a content problem.",
    );
  } else if (openTrend < 0 && unsubTrend > 0) {
    tips.push(
      "Open rate and unsubscribe rate are both trending the wrong way together, worth treating as a content-fit signal rather than deliverability alone.",
    );
  } else {
    tips.push("Open rate has held steady or improved across this window.");
  }

  return tips;
}

/** Overview "Tips for improving CTR" card, two real-computed bullets. */
export function generateCtrTips(editions: InsightEdition[]): string[] {
  if (editions.length < 2) return ["Not enough editions in this window yet to surface a pattern."];

  const hookAveragesByCtr = computeHookTypeAverages(editions).sort(
    (a, b) => b.avgCtr - a.avgCtr,
  );
  const tips: string[] = [];

  if (hookAveragesByCtr.length >= 2) {
    const top = hookAveragesByCtr[0];
    const bottom = hookAveragesByCtr[hookAveragesByCtr.length - 1];
    tips.push(
      `Editions tagged "${top.label}" are averaging a ${top.avgCtr}% click rate in this window, ahead of "${bottom.label}" at ${bottom.avgCtr}%.`,
    );
  }

  const byQuality = [...editions].sort((a, b) => b.qualityTotal - a.qualityTotal);
  const [topHalf, bottomHalf] = halves(byQuality);
  const topCtr = Math.round(avg(topHalf.map((e) => e.ctrOverall)) * 100) / 100;
  const bottomCtr = Math.round(avg(bottomHalf.map((e) => e.ctrOverall)) * 100) / 100;
  tips.push(
    topCtr >= bottomCtr
      ? `Editions scoring above the window's median quality clicked through at ${topCtr}% on average, vs ${bottomCtr}% for editions below it.`
      : `Click rate isn't tracking quality score cleanly this window (${topCtr}% above-median vs ${bottomCtr}% below), worth a closer look edition by edition.`,
  );

  return tips;
}

export interface AudienceFeedback {
  narrative: string;
  actionSteps: string[];
}

/** Overview "Batch 1 / Batch 2" feedback + action-step cards. */
export function generateAudienceFeedback(
  editions: InsightEdition[],
  audience: "batch1" | "batch2",
): AudienceFeedback {
  const chronological = [...editions].sort(
    (a, b) => a.publishedAt.getTime() - b.publishedAt.getTime(),
  );
  const [earlier, later] = halves(chronological);
  const improving = avg(later.map((e) => e.ctrOverall)) >= avg(earlier.map((e) => e.ctrOverall));

  if (audience === "batch1") {
    return improving
      ? {
          narrative:
            "Same-day, actionable Leads are earning the strongest click-through this window. Analysis-only openings underperform.",
          actionSteps: [
            "Close every Lead with one same-day task.",
            "Study Marketing Brew's per-item \"what to do\" line.",
          ],
        }
      : {
          narrative:
            "Click-through for practitioner-relevant content has softened across this window. Consider trading some analysis depth for a concrete same-day action.",
          actionSteps: [
            "Add a one-line, same-day action to every Lead.",
            "A/B one tactical close vs one analytical close and compare CTR next window.",
          ],
        };
  }

  return improving
    ? {
        narrative:
          "Category-signal framing continues to land. A budget or vendor angle would sharpen it further for this reader.",
        actionSteps: [
          "Add a resource-allocation question, Growth Memo style, to close-outs.",
          "Flag vendor or category shifts explicitly in the Lead.",
        ],
      }
    : {
        narrative:
          "Leadership-relevant engagement has cooled this window. Content may be skewing tactical for a reader looking for strategic signal.",
        actionSteps: [
          "Reframe one Lead per week around a structural or budget question.",
          "Name the category-level implication before the tactical detail.",
        ],
      };
}
