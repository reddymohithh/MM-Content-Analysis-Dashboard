/**
 * Editorial content-quality rubric. The actual grading standard sent to the
 * LLM is global-content-analysis-checklist.md, embedded verbatim (word for
 * word, unmodified) in buildContentQualitySystemPrompt() below -- the
 * checklist itself is the source of truth, not a paraphrase of it built from
 * this file's constants. This file builds the full structured-output schema
 * matching the checklist's Section 23 "Updated Required Final Analysis
 * Output" order, and keeps the 12 category keys/labels/weights (Section 6/7)
 * needed to compute the weighted 0-100 total ourselves rather than trust the
 * LLM's arithmetic.
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
  /** 0-5, or null when the LLM judged this category N/A for this edition.
   * For audience_relevance specifically, this is the Combined score
   * (Section 7.1) -- the same value that feeds the weighted total below,
   * exactly as for every other category. */
  score: number | null;
  /** This category's actual contribution to the 100-point total, after N/A
   * weight redistribution -- null categories always show 0 here. */
  effectiveWeight: number;
  justification: string;
  /** Section 7.1: "Evaluate [Audience Relevance] separately for
   * Practitioners and Leadership." Populated only for audience_relevance;
   * null for every other category. Display-only -- never enters the
   * weighted total, which uses `score` (Combined) exactly as before. */
  practitionersScore: number | null;
  leadershipScore: number | null;
}

// --- Section 12: score -> classification (computed by us, not the LLM, so
// the label displayed always matches the number it's next to) -----------

export type ContentQualityClassification =
  | "Exceptional"
  | "Very Good"
  | "Good"
  | "Average"
  | "Weak"
  | "Poor";

export function classifyContentQuality(total: number): ContentQualityClassification {
  if (total >= 90) return "Exceptional";
  if (total >= 80) return "Very Good";
  if (total >= 70) return "Good";
  if (total >= 60) return "Average";
  if (total >= 50) return "Weak";
  return "Poor";
}

// --- Section 15: Audience Fit / Reader Outcome --------------------------

export interface ScoredAssessment {
  score: number; // 0-5
  assessment: string;
}

export type CombinedAudienceClassification =
  | "Strong for both"
  | "Adequate for both"
  | "Primarily practitioner-focused"
  | "Primarily leadership-focused"
  | "Weak for both";

export interface AudienceFit {
  practitioners: ScoredAssessment;
  leadership: ScoredAssessment;
  combined: ScoredAssessment & { classification: CombinedAudienceClassification };
}

export interface ReaderOutcome {
  industryAwareness: ScoredAssessment;
  upskilling: ScoredAssessment;
  practicalExperimentation: ScoredAssessment;
}

// --- Section 10/23: Story-by-Story Analysis -----------------------------

export type ContentTypeTag =
  | "News"
  | "Resource"
  | "Guide"
  | "Analysis"
  | "Opinion"
  | "Case Study"
  | "Research / Data"
  | "Tool"
  | "Prompt / Workflow"
  | "Example / Inspiration"
  | "Other";

export type PrimaryAudience = "Practitioners" | "Leadership" | "Both";

export interface StoryAnalysis {
  title: string;
  contentType: ContentTypeTag;
  primaryAudience: PrimaryAudience;
  storyQualityScore: number; // 0-100
  whySelected: string;
  whatMarketingMonkAdded: string;
  whatReaderLearns: string;
  practicalOpportunity: string; // "Not applicable" when none
  curationNecessity: number; // 1-10, Section 10
  mainWeakness: string;
}

// --- Section 17: Audience-Specific Editorial Feedback -------------------

export interface AudienceFeedback {
  overallFeedback: string;
  whatWereDoingRight: string[];
  whatWeNeedToWorkOn: string[];
  whatShouldBeAdded: string[];
  takeaway: string;
}

// --- Section 18: Cross-Batch Feedback ------------------------------------

export type AudienceBalance =
  | "Balanced"
  | "Practitioner-heavy"
  | "Leadership-heavy"
  | "Weak for both";

export interface CrossBatchFeedback {
  audienceBalance: AudienceBalance;
  audienceBalanceExplanation: string;
  sharedStrengths: string[];
  sharedWeaknesses: string[];
  audienceConflict: string;
  recommendedBalance: string;
}

// --- Section 19: Next-Edition Improvement Plan ---------------------------

export type ImprovementPriority = "P0" | "P1" | "P2" | "P3";

export interface ImprovementPlanItem {
  priority: ImprovementPriority;
  improvement: string;
  audience: PrimaryAudience;
  whyItMatters: string;
  expectedImpact: string;
}

// --- Section 20: Content Opportunities for Future Editions ---------------

export type SuggestedTreatment =
  | "News"
  | "Guide"
  | "Analysis"
  | "Resource"
  | "Experiment"
  | "Case Study"
  | "Other";

export interface ContentOpportunity {
  opportunity: string;
  whyItMatters: string;
  bestAudience: PrimaryAudience;
  suggestedTreatment: SuggestedTreatment;
}

// --- Section 22: Final Feedback Summary --------------------------------
// Four sub-sections, all required. Deliberately concise (short answers,
// not the bulleted lists Sections 17/18 already carry) -- this is meant to
// be a compressed closing summary, not a restatement of that detail.

/** Section 22's Practitioners/Leadership sub-summary: the same five
 * questions, answered in one short sentence each. */
export interface AudienceFinalSummary {
  doingRight: string;
  shouldImprove: string;
  shouldAdd: string;
  shouldPreserve: string;
  highestImpactImprovement: string;
}

/** Section 22's Cross-Batch sub-summary: two questions, not five. */
export interface CrossBatchFinalSummary {
  balanced: string; // "Is the edition balanced between the two audiences?"
  nextEditionDifference: string; // "What should the next edition do differently..."
}

export interface FinalSummary {
  biggestStrength: string;
  biggestWeakness: string;
  singleMostValuableChange: string;
  practitioners: AudienceFinalSummary;
  leadership: AudienceFinalSummary;
  crossBatch: CrossBatchFinalSummary;
}

export interface ContentQualityResult {
  total: number; // 0-100, computed from categories
  classification: ContentQualityClassification; // computed from total, Section 12
  categories: ContentQualityCategoryResult[];
  verdict: string; // Section 15/23 Executive Verdict + Final Decision's one-sentence verdict
  audienceFit: AudienceFit;
  readerOutcome: ReaderOutcome;
  storyByStory: StoryAnalysis[];
  whatWorked: string[];
  whatDidntWork: string[];
  biggestMissedOpportunity: string;
  batch1: AudienceFeedback; // Section 17: Batch 1 -- Practitioners
  batch2: AudienceFeedback; // Section 17: Batch 2 -- Marketing & Growth Leadership
  crossBatch: CrossBatchFeedback;
  recommendedImprovements: string[];
  nextEditionPlan: ImprovementPlanItem[];
  contentOpportunities: ContentOpportunity[];
  strengthsToPreserve: string[];
  /** Section 13. Empty array means no critical failure -- the checklist's
   * own required phrasing ("No P0 issues identified") is used in the UI
   * for that empty state, not asked of the LLM as a literal string. */
  criticalFailures: string[];
  finalSummary: FinalSummary;
}

/**
 * Takes raw 0-5 (or null/N/A) scores per category and computes the final
 * 0-100 total, excluding N/A categories from the denominator and
 * redistributing their weight proportionally across the remaining
 * categories -- exactly the rule the checklist specifies (Section 4). Done
 * in our own code rather than trusted to the LLM's arithmetic.
 *
 * `practitionersScore`/`leadershipScore` (Section 7.1, audience_relevance
 * only) pass straight through to the output unchanged -- they play no part
 * in this calculation. The weighting math below is exactly what it was
 * before Section 7.1 was accounted for: one `score` per category, same
 * formula, same single Global Content Quality Score.
 */
export function computeContentQualityTotal(
  raw: {
    key: ContentQualityCategoryKey;
    score: number | null;
    justification: string;
    practitionersScore?: number | null;
    leadershipScore?: number | null;
  }[],
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
      practitionersScore: r.practitionersScore ?? null,
      leadershipScore: r.leadershipScore ?? null,
    };
  });

  // score is 0-5; *20 puts a perfect score at 100, then weighted by each
  // category's share of the redistributed 100%. Unchanged from before
  // Section 7.1 support was added -- practitionersScore/leadershipScore
  // never enter this sum.
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

const scoredAssessmentSchema = (max: number) => ({
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "integer", minimum: 0, maximum: max },
    assessment: { type: "string" },
  },
  required: ["score", "assessment"],
});

const stringArray = (minItems: number, maxItems: number) => ({
  type: "array",
  items: { type: "string" },
  minItems,
  maxItems,
});

const audienceFinalSummarySchema = (label: string) => ({
  type: "object",
  description: `Section 22, ${label} sub-summary. Five short, concise answers -- one sentence each, not a restatement of Section 17's detailed lists.`,
  additionalProperties: false,
  properties: {
    doingRight: { type: "string", description: "What are we doing right?" },
    shouldImprove: { type: "string", description: "What should we improve?" },
    shouldAdd: { type: "string", description: "What should we add?" },
    shouldPreserve: { type: "string", description: "What should we preserve?" },
    highestImpactImprovement: { type: "string", description: "What is the single highest-impact improvement?" },
  },
  required: ["doingRight", "shouldImprove", "shouldAdd", "shouldPreserve", "highestImpactImprovement"],
});

const audienceFeedbackSchema = (label: string) => ({
  type: "object",
  description: `Section 17, ${label}: Feedback.`,
  additionalProperties: false,
  properties: {
    overallFeedback: { type: "string" },
    whatWereDoingRight: stringArray(3, 5),
    whatWeNeedToWorkOn: stringArray(3, 5),
    whatShouldBeAdded: stringArray(1, 5),
    takeaway: { type: "string" },
  },
  required: ["overallFeedback", "whatWereDoingRight", "whatWeNeedToWorkOn", "whatShouldBeAdded", "takeaway"],
});

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
            key: { type: "string", enum: CONTENT_QUALITY_CATEGORIES.map((c) => c.key) },
            score: {
              type: ["integer", "null"],
              minimum: 0,
              maximum: 5,
              description:
                "0-5 per Section 6's scale, or null if this category is genuinely N/A for this edition. " +
                "For audience_relevance specifically, this is the Combined score (see practitionersScore/" +
                "leadershipScore below) -- the single value that feeds the weighted Global Content Quality Score, " +
                "same as every other category.",
            },
            justification: { type: "string" },
            practitionersScore: {
              type: ["integer", "null"],
              minimum: 0,
              maximum: 5,
              description:
                "Section 7.1: 'Evaluate [Audience Relevance] separately for Practitioners and Leadership.' " +
                "Only set this for the audience_relevance category -- null for every other category.",
            },
            leadershipScore: {
              type: ["integer", "null"],
              minimum: 0,
              maximum: 5,
              description:
                "Section 7.1's Leadership counterpart to practitionersScore. Only set for audience_relevance, " +
                "null for every other category.",
            },
          },
          required: ["key", "score", "justification", "practitionersScore", "leadershipScore"],
        },
        minItems: CONTENT_QUALITY_CATEGORIES.length,
        maxItems: CONTENT_QUALITY_CATEGORIES.length,
      },
      verdict: {
        type: "string",
        description: "Section 15 Executive Verdict's one-sentence verdict explaining the overall editorial quality.",
      },
      audienceFit: {
        type: "object",
        description: "Section 15 Audience Fit table.",
        additionalProperties: false,
        properties: {
          practitioners: scoredAssessmentSchema(5),
          leadership: scoredAssessmentSchema(5),
          combined: {
            type: "object",
            additionalProperties: false,
            properties: {
              score: { type: "integer", minimum: 0, maximum: 5 },
              assessment: { type: "string" },
              classification: {
                type: "string",
                description: "Section 8 Combined Audience Assessment.",
                enum: [
                  "Strong for both",
                  "Adequate for both",
                  "Primarily practitioner-focused",
                  "Primarily leadership-focused",
                  "Weak for both",
                ],
              },
            },
            required: ["score", "assessment", "classification"],
          },
        },
        required: ["practitioners", "leadership", "combined"],
      },
      readerOutcome: {
        type: "object",
        description: "Section 9/15 Reader Outcome table.",
        additionalProperties: false,
        properties: {
          industryAwareness: scoredAssessmentSchema(5),
          upskilling: scoredAssessmentSchema(5),
          practicalExperimentation: scoredAssessmentSchema(5),
        },
        required: ["industryAwareness", "upskilling", "practicalExperimentation"],
      },
      storyByStory: {
        type: "array",
        description: "Section 10/23 Story-by-Story Analysis, one entry per major item in the edition.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            contentType: {
              type: "string",
              enum: [
                "News", "Resource", "Guide", "Analysis", "Opinion", "Case Study",
                "Research / Data", "Tool", "Prompt / Workflow", "Example / Inspiration", "Other",
              ],
            },
            primaryAudience: { type: "string", enum: ["Practitioners", "Leadership", "Both"] },
            storyQualityScore: { type: "integer", minimum: 0, maximum: 100 },
            whySelected: { type: "string" },
            whatMarketingMonkAdded: { type: "string" },
            whatReaderLearns: { type: "string" },
            practicalOpportunity: { type: "string", description: "Write 'Not applicable' when there is none." },
            curationNecessity: {
              type: "integer",
              minimum: 1,
              maximum: 10,
              description: "Section 10: how difficult the reader would find this without Marketing Monk.",
            },
            mainWeakness: { type: "string" },
          },
          required: [
            "title", "contentType", "primaryAudience", "storyQualityScore", "whySelected",
            "whatMarketingMonkAdded", "whatReaderLearns", "practicalOpportunity", "curationNecessity", "mainWeakness",
          ],
        },
        minItems: 1,
        maxItems: 10,
      },
      whatWorked: { ...stringArray(3, 5), description: "Section 15 What Worked." },
      whatDidntWork: { ...stringArray(3, 5), description: "Section 15 What Didn't Work." },
      biggestMissedOpportunity: { type: "string", description: "Section 15 Biggest Missed Opportunity." },
      batch1: audienceFeedbackSchema("Batch 1 -- Practitioners"),
      batch2: audienceFeedbackSchema("Batch 2 -- Marketing & Growth Leadership"),
      crossBatch: {
        type: "object",
        description: "Section 18 Cross-Batch Feedback.",
        additionalProperties: false,
        properties: {
          audienceBalance: {
            type: "string",
            enum: ["Balanced", "Practitioner-heavy", "Leadership-heavy", "Weak for both"],
          },
          audienceBalanceExplanation: { type: "string" },
          sharedStrengths: stringArray(1, 5),
          sharedWeaknesses: stringArray(1, 5),
          audienceConflict: { type: "string" },
          recommendedBalance: { type: "string" },
        },
        required: [
          "audienceBalance", "audienceBalanceExplanation", "sharedStrengths",
          "sharedWeaknesses", "audienceConflict", "recommendedBalance",
        ],
      },
      recommendedImprovements: { ...stringArray(3, 5), description: "Section 15 Recommended Improvements." },
      nextEditionPlan: {
        type: "array",
        description: "Section 19 Next-Edition Improvement Plan, ranked by priority.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            priority: { type: "string", enum: ["P0", "P1", "P2", "P3"] },
            improvement: { type: "string" },
            audience: { type: "string", enum: ["Practitioners", "Leadership", "Both"] },
            whyItMatters: { type: "string" },
            expectedImpact: { type: "string" },
          },
          required: ["priority", "improvement", "audience", "whyItMatters", "expectedImpact"],
        },
        minItems: 1,
        maxItems: 8,
      },
      contentOpportunities: {
        type: "array",
        description: "Section 20 Content Opportunities for Future Editions.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            opportunity: { type: "string" },
            whyItMatters: { type: "string" },
            bestAudience: { type: "string", enum: ["Practitioners", "Leadership", "Both"] },
            suggestedTreatment: {
              type: "string",
              enum: ["News", "Guide", "Analysis", "Resource", "Experiment", "Case Study", "Other"],
            },
          },
          required: ["opportunity", "whyItMatters", "bestAudience", "suggestedTreatment"],
        },
        minItems: 3,
        maxItems: 5,
      },
      strengthsToPreserve: { ...stringArray(2, 6), description: "Section 21 Editorial Strengths to Preserve." },
      criticalFailures: {
        type: "array",
        items: { type: "string" },
        minItems: 0,
        maxItems: 5,
        description:
          "Section 13 Critical-Failure Rules. Empty array if none apply -- do not manufacture an issue to fill this.",
      },
      finalSummary: {
        type: "object",
        description:
          "Section 22 Final Feedback Summary, all four required sub-sections. Keep every answer short and " +
          "concise -- this closes the analysis, it does not restate Sections 17/18's detailed lists.",
        additionalProperties: false,
        properties: {
          biggestStrength: { type: "string", description: "Overall: what is the biggest strength of this edition?" },
          biggestWeakness: { type: "string", description: "Overall: what is the biggest weakness?" },
          singleMostValuableChange: {
            type: "string",
            description: "Overall: what single change would most improve the next edition?",
          },
          practitioners: audienceFinalSummarySchema("Practitioners"),
          leadership: audienceFinalSummarySchema("Leadership"),
          crossBatch: {
            type: "object",
            description: "Section 22, Cross-Batch sub-summary. Two short answers.",
            additionalProperties: false,
            properties: {
              balanced: { type: "string", description: "Is the edition balanced between the two audiences?" },
              nextEditionDifference: {
                type: "string",
                description: "What should the next edition do differently to serve both audiences better?",
              },
            },
            required: ["balanced", "nextEditionDifference"],
          },
        },
        required: [
          "biggestStrength", "biggestWeakness", "singleMostValuableChange",
          "practitioners", "leadership", "crossBatch",
        ],
      },
    },
    required: [
      "categories", "verdict", "audienceFit", "readerOutcome", "storyByStory", "whatWorked", "whatDidntWork",
      "biggestMissedOpportunity", "batch1", "batch2", "crossBatch", "recommendedImprovements", "nextEditionPlan",
      "contentOpportunities", "strengthsToPreserve", "criticalFailures", "finalSummary",
    ],
  },
} as const;
