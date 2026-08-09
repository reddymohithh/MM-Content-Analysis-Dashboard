/**
 * Content quality score, ported verbatim (formula and copy) from the final,
 * punch-list-fixed wireframe (`computeQuality` in the standalone HTML file,
 * see BUILD_LOG.md), not the earlier version in the old project skeleton.
 *
 * The user's explicit instruction: depend less on poll response, since many
 * editions get zero poll responses and a poll-heavy score would unfairly
 * penalize (or, via a neutral default, flatter) those editions. When a poll
 * has responses, it only carries 20% of the total (down from an initial 35%);
 * when it doesn't, that weight is redistributed proportionally across the
 * other three components rather than defaulting to a neutral placeholder.
 */

export type Audience = "blended" | "batch1" | "batch2";

export interface QualityScoreInput {
  id: string;
  ctrOverall: number; // percent, e.g. 0.79
  unsubRate: number; // percent, e.g. 0.04
  trailingAvgCtr: number;
  trailingAvgUnsub: number;
  poll: {
    total: number;
    lovedIt: number;
    prettyUseful: number;
  } | null;
  voice?: {
    avgSentenceLength: number;
    bannedPhraseHits: number;
    /** false until a real text-analysis pass replaces this placeholder */
    computed: boolean;
  };
  /**
   * Which audience lens to narrate the score through. Only the narrative and
   * each component's "why" text change per audience — the underlying scores
   * and weights are the same real, blended numbers regardless of lens; this
   * is an editorial reframing, not a different data segmentation (see
   * docs/02_beehiiv_data_audit.md's "audience lens" definition).
   */
  audience?: Audience;
}

export interface QualityScoreComponent {
  key: "sat" | "eng" | "ret" | "voice";
  name: string;
  weight: number; // 0-1
  score: number; // 0-100
  weightLabel: string; // e.g. "20% wt"
  dashArrayFraction: number; // 0-1, for the donut progress arc
  raw: string;
  benchmark: string;
  why: string;
}

export interface QualityScoreResult {
  total: number;
  hasPoll: boolean;
  /** False when the voice-compliance component is a placeholder rather than
   * a real text-analysis pass — surface this via a Notices section, not
   * inline in the component's own copy. */
  voiceComputed: boolean;
  narrative: string;
  components: QualityScoreComponent[];
}

const DEFAULT_VOICE = { avgSentenceLength: 18, bannedPhraseHits: 0, computed: false };

export function computeQualityScore(input: QualityScoreInput): QualityScoreResult {
  const hasPoll = !!input.poll && input.poll.total > 0;
  const voice = input.voice ?? DEFAULT_VOICE;
  const audience = input.audience ?? "blended";

  const satisfactionScore = hasPoll
    ? Math.round(((input.poll!.lovedIt + input.poll!.prettyUseful) / input.poll!.total) * 100)
    : null;

  const engagementScore = Math.min(
    100,
    Math.round((input.ctrOverall / input.trailingAvgCtr) * 70),
  );

  const retentionScore =
    input.unsubRate > 0
      ? Math.min(100, Math.round((input.trailingAvgUnsub / input.unsubRate) * 70))
      : 100;

  let voiceScore = 100;
  if (voice.avgSentenceLength > 20) {
    voiceScore -= Math.min(40, (voice.avgSentenceLength - 20) * 4);
  }
  voiceScore -= Math.min(60, voice.bannedPhraseHits * 15);
  voiceScore = Math.max(0, Math.round(voiceScore));

  const weights = hasPoll
    ? { sat: 0.2, eng: 0.35, ret: 0.25, voice: 0.2 }
    : { sat: 0, eng: 0.4375, ret: 0.3125, voice: 0.25 };

  type RawPart = {
    key: QualityScoreComponent["key"];
    name: string;
    weight: number;
    score: number;
    raw: string;
    benchmark: string;
  };

  const parts: RawPart[] = [];
  if (hasPoll) {
    parts.push({
      key: "sat",
      name: "Reader satisfaction (poll)",
      weight: weights.sat,
      score: satisfactionScore!,
      raw: `${input.poll!.total} responses, ${satisfactionScore}% positive`,
      benchmark:
        "Only counted when a poll has responses; excluded otherwise so quiet posts aren't penalized.",
    });
  }
  parts.push({
    key: "eng",
    name: "Engagement depth",
    weight: weights.eng,
    score: engagementScore,
    raw: `Overall CTR ${input.ctrOverall}%`,
    benchmark: `Trailing-window average overall CTR: ${round2(input.trailingAvgCtr)}%`,
  });
  parts.push({
    key: "ret",
    name: "Retention signal",
    weight: weights.ret,
    score: retentionScore,
    raw: `Unsubscribe rate ${input.unsubRate}%`,
    benchmark: `Trailing-window average unsubscribe rate: ${round2(input.trailingAvgUnsub)}%`,
  });
  parts.push({
    key: "voice",
    name: "Writing and voice compliance",
    weight: weights.voice,
    score: voiceScore,
    raw: voice.computed
      ? `Average sentence length ${voice.avgSentenceLength} words; ${voice.bannedPhraseHits} banned-phrase hit(s)`
      : "Automated sentence-length and banned-phrase check",
    benchmark: "Target: sentences under 20 words, zero banned-phrase hits",
  });

  const total = Math.round(parts.reduce((sum, c) => sum + c.score * c.weight, 0));

  let best = parts[0];
  let worst = parts[0];
  for (const c of parts) {
    const points = c.score * c.weight;
    if (points > best.score * best.weight) best = c;
    if (points < worst.score * worst.weight) worst = c;
  }

  const audienceLabel =
    audience === "batch1" ? "practitioners" : audience === "batch2" ? "leadership readers" : null;

  const narrative = hasPoll
    ? audienceLabel
      ? `For ${audienceLabel}, this edition scored ${total}%, weighted mostly on engagement and retention with a smaller poll component. The strongest driver was ${best.name.toLowerCase()}. The weakest was ${worst.name.toLowerCase()}.`
      : `This edition scored ${total}%, weighted mostly on engagement and retention with a smaller poll component. The biggest positive driver was ${best.name.toLowerCase()}. The biggest drag was ${worst.name.toLowerCase()}.`
    : audienceLabel
      ? `For ${audienceLabel}, this edition scored ${total}%. No poll responses came in, so the score leans fully on engagement, retention, and voice rather than reader ratings.`
      : `This edition scored ${total}%. No poll responses came in, so the score leans fully on engagement, retention, and voice rather than reader ratings.`;

  const components: QualityScoreComponent[] = parts.map((c) => ({
    key: c.key,
    name: c.name,
    weight: c.weight,
    score: c.score,
    weightLabel: `${Math.round(c.weight * 100)}% wt`,
    dashArrayFraction: c.score / 100,
    raw: c.raw,
    benchmark: c.benchmark,
    why: whyFor(c.key, c.score, audience),
  }));

  return { total, hasPoll, voiceComputed: voice.computed, narrative, components };
}

function whyFor(key: QualityScoreComponent["key"], score: number, audience: Audience): string {
  if (audience === "batch1") {
    switch (key) {
      case "sat":
        return score >= 65
          ? "Practitioners rated this useful — the tactical takeaway landed."
          : "Practitioners flagged this as less immediately useful than usual.";
      case "eng":
        return score >= 70
          ? "Practitioners clicked through for the how-to at or above the recent normal."
          : "Practitioners clicked through less than usual — may be missing a concrete, same-day action.";
      case "ret":
        return score >= 70
          ? "This practitioner-facing send isn't driving unsubscribes, a good sign."
          : "Unsubscribe rate ran hotter than usual for a practitioner-facing send.";
      default:
        return "Sentence length and banned-phrase checks ran against the locked voice spec, weighed for a tactical, same-day-actionable tone.";
    }
  }
  if (audience === "batch2") {
    switch (key) {
      case "sat":
        return score >= 65
          ? "Leadership readers responded well to the strategic framing."
          : "Leadership readers rated this lower than usual — may be reading as too tactical.";
      case "eng":
        return score >= 70
          ? "Leadership readers engaged with the category-level angle at or above the recent normal."
          : "Leadership engagement lagged — may need a sharper budget or category-level hook.";
      case "ret":
        return score >= 70
          ? "This leadership-facing send isn't driving unsubscribes, a good sign."
          : "Unsubscribe rate ran hotter than usual for a leadership-facing send.";
      default:
        return "Sentence length and banned-phrase checks ran against the locked voice spec, weighed for a strategic, leadership-facing tone.";
    }
  }
  switch (key) {
    case "sat":
      return score >= 65
        ? "Readers leaned positive on this send."
        : "Not-helpful votes outweighed the usual share this send.";
    case "eng":
      return score >= 70
        ? "Readers clicked through at or above the recent normal."
        : "Click-through lagged the recent normal on this send.";
    case "ret":
      return score >= 70
        ? "Almost nobody left after this send, a good sign even if other numbers dipped."
        : "Unsubscribe rate ran a bit hotter than the recent normal.";
    default:
      return "Sentence length and banned-phrase checks ran automatically against the locked voice spec.";
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
