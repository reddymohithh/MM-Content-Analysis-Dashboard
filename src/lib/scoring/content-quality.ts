/**
 * Editorial content-quality rubric. The actual grading standard sent to the
 * LLM is global-content-analysis-checklist.md, embedded verbatim (word for
 * word, unmodified) in buildContentQualitySystemPrompt() below -- the
 * checklist itself is the source of truth, not a paraphrase of it built from
 * this file's constants. This file only keeps the 12 category
 * keys/labels/weights (matching the checklist's Section 6/7 exactly) needed
 * to compute the weighted 0-100 total and render the category breakdown in
 * the UI, plus the JSON Schema contract the structured-output call is forced
 * into (a separate mechanism from the prompt text itself).
 *
 * Deliberately separate from src/lib/scoring/quality-score.ts: that module
 * scores reader response (CTR, unsubscribes, polls) against trailing-window
 * benchmarks; this one scores editorial quality of the content itself, which
 * the checklist's own Section 14 says must NOT be inferred from engagement
 * metrics. This score only ever comes from an LLM (or a human) actually
 * reading the edition's content.
 */

import { readFileSync } from "fs";
import path from "path";

export type ContentQualityCategoryKey =
  | "audience_relevance"
  | "topic_selection"
  | "editorial_value_add"
  | "originality"
  | "depth_substance"
  | "accuracy_credibility"
  | "actionability"
  | "readability_structure"
  | "narrative_engagement"
  | "curation_coherence"
  | "voice_brand_fit"
  | "memorability";

export interface ContentQualityCategoryDef {
  key: ContentQualityCategoryKey;
  label: string;
  weight: number; // fraction of 1.0, sums to 1
}

/** Matches global-content-analysis-checklist.md Section 6/7 exactly. */
export const CONTENT_QUALITY_CATEGORIES: ContentQualityCategoryDef[] = [
  { key: "audience_relevance", label: "Audience Relevance", weight: 0.14 },
  { key: "topic_selection", label: "Topic / Story Selection", weight: 0.14 },
  { key: "editorial_value_add", label: "Editorial Value-Add", weight: 0.14 },
  { key: "originality", label: "Originality & Information Value", weight: 0.09 },
  { key: "depth_substance", label: "Depth & Substance", weight: 0.09 },
  { key: "accuracy_credibility", label: "Accuracy & Credibility", weight: 0.09 },
  { key: "actionability", label: "Actionability / Practical Value", weight: 0.09 },
  { key: "readability_structure", label: "Readability & Content Structure", weight: 0.05 },
  { key: "narrative_engagement", label: "Narrative / Engagement Quality", weight: 0.05 },
  { key: "curation_coherence", label: "Curation & Newsletter Coherence", weight: 0.05 },
  { key: "voice_brand_fit", label: "Voice & Brand Fit", weight: 0.04 },
  { key: "memorability", label: "Memorability", weight: 0.03 },
];

export interface ContentQualityCategoryResult {
  key: ContentQualityCategoryKey;
  label: string;
  weight: number;
  /** 0-5, or null when the LLM judged this category N/A for this edition. */
  score: number | null;
  /** This category's actual contribution to the 100-point total, after N/A
   * weight redistribution -- null categories always show 0 here. */
  effectiveWeight: number;
  justification: string;
}

/** Section 17's per-batch qualitative feedback, narrowed to what the UI
 * needs: an overall-feedback narrative and the highest-impact tips. */
export interface AudienceFeedback {
  narrative: string;
  tips: string[];
}

export interface ContentQualityResult {
  total: number; // 0-100
  categories: ContentQualityCategoryResult[];
  batch1: AudienceFeedback; // Section 17: Batch 1 -- Practitioners
  batch2: AudienceFeedback; // Section 17: Batch 2 -- Marketing & Growth Leadership
}

/**
 * Takes raw 0-5 (or null/N/A) scores per category and computes the final
 * 0-100 total, excluding N/A categories from the denominator and
 * redistributing their weight proportionally across the remaining
 * categories -- exactly the rule the checklist specifies (Section 4). Done
 * in our own code rather than trusted to the LLM's arithmetic.
 */
export function computeContentQualityTotal(
  raw: { key: ContentQualityCategoryKey; score: number | null; justification: string }[],
): { total: number; categories: ContentQualityCategoryResult[] } {
  const applicable = raw.filter((r) => r.score !== null);
  const applicableWeightSum = applicable.reduce((sum, r) => {
    const def = CONTENT_QUALITY_CATEGORIES.find((c) => c.key === r.key)!;
    return sum + def.weight;
  }, 0);

  const categories: ContentQualityCategoryResult[] = raw.map((r) => {
    const def = CONTENT_QUALITY_CATEGORIES.find((c) => c.key === r.key)!;
    const effectiveWeight =
      r.score === null || applicableWeightSum === 0 ? 0 : def.weight / applicableWeightSum;
    return {
      key: r.key,
      label: def.label,
      weight: def.weight,
      score: r.score,
      effectiveWeight,
      justification: r.justification,
    };
  });

  // score is 0-5; *20 puts a perfect score at 100, then weighted by each
  // category's share of the redistributed 100%.
  const total = Math.round(
    categories.reduce((sum, c) => sum + (c.score ?? 0) * 20 * c.effectiveWeight, 0),
  );

  return { total, categories };
}

let cachedChecklist: string | null = null;

/**
 * System prompt: the full checklist markdown, verbatim, unmodified -- per
 * the user's explicit instruction to pass it "as it is... word by word."
 * No extra instructions are appended here; the required JSON output shape
 * is enforced separately by CONTENT_QUALITY_JSON_SCHEMA's own "strict" mode
 * and its per-field "description" metadata below, not by prompt text.
 */
export function buildContentQualitySystemPrompt(): string {
  if (cachedChecklist === null) {
    cachedChecklist = readFileSync(
      path.join(process.cwd(), "src/lib/scoring/global-content-analysis-checklist.md"),
      "utf-8",
    );
  }
  return cachedChecklist;
}

export const CONTENT_QUALITY_JSON_SCHEMA = {
  name: "content_quality_score",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      categories: {
        type: "array",
        description:
          "One entry per category from Section 6 (Global Content Quality Score), scored per Section 7's detailed criteria.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            key: {
              type: "string",
              enum: CONTENT_QUALITY_CATEGORIES.map((c) => c.key),
            },
            score: {
              type: ["integer", "null"],
              minimum: 0,
              maximum: 5,
              description: "0-5 per Section 6's scale, or null if this category is genuinely N/A for this edition.",
            },
            justification: { type: "string" },
          },
          required: ["key", "score", "justification"],
        },
        minItems: CONTENT_QUALITY_CATEGORIES.length,
        maxItems: CONTENT_QUALITY_CATEGORIES.length,
      },
      batch1: {
        type: "object",
        description:
          "Section 17, Batch 1 -- Practitioners: Feedback. \"narrative\" is the Overall Feedback paragraph. \"tips\" are the highest-impact items from What We Need to Work On / What Should Be Added, written as concrete editorial actions, not generic platitudes.",
        additionalProperties: false,
        properties: {
          narrative: { type: "string" },
          tips: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 2 },
        },
        required: ["narrative", "tips"],
      },
      batch2: {
        type: "object",
        description:
          "Section 17, Batch 2 -- Marketing & Growth Leadership: Feedback. Same structure as batch1, for the leadership audience.",
        additionalProperties: false,
        properties: {
          narrative: { type: "string" },
          tips: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 2 },
        },
        required: ["narrative", "tips"],
      },
    },
    required: ["categories", "batch1", "batch2"],
  },
} as const;
