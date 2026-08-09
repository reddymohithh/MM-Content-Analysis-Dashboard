/**
 * Editorial content-quality rubric — the "Global Newsletter Content Analysis
 * Checklist" the user supplied, ported verbatim (categories, weights, core
 * questions, 0-5 scale, N/A-redistribution rule). This is deliberately
 * separate from src/lib/scoring/quality-score.ts: that module scores reader
 * response (CTR, unsubscribes, polls) against trailing-window benchmarks;
 * this one scores editorial quality of the content itself, which per the
 * checklist's own "Recommended Interpretation" section must NOT be inferred
 * from engagement metrics. This score only ever comes from an LLM (or a
 * human) actually reading the edition's content.
 */

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
  coreQuestion: string;
  criteria: string[];
}

export const CONTENT_QUALITY_CATEGORIES: ContentQualityCategoryDef[] = [
  {
    key: "audience_relevance",
    label: "Audience Relevance",
    weight: 0.14,
    coreQuestion: "If I am the target reader, do I genuinely care about this?",
    criteria: [
      "Clearly relevant to the target audience",
      "Addresses the audience's interests, problems, goals, or curiosity",
      "Appropriate for the audience's knowledge level",
      "Fits the newsletter's stated positioning",
      "Doesn't include information simply because it's trending",
      "Provides enough context for the intended reader",
    ],
  },
  {
    key: "topic_selection",
    label: "Topic / Story Selection",
    weight: 0.14,
    coreQuestion: "Of everything the reader could have seen today, was this worth selecting?",
    criteria: [
      "Topic is genuinely interesting",
      "Topic has meaningful significance",
      "Topic is timely",
      "Topic has a clear reason for being included",
      "Editor demonstrates strong judgment in selecting it",
      "Story isn't generic or easily replaceable",
      "Selection adds signal rather than noise",
    ],
  },
  {
    key: "editorial_value_add",
    label: "Editorial Value-Add",
    weight: 0.14,
    coreQuestion: "What did the newsletter add that I wouldn't get from the original source?",
    criteria: [
      "Doesn't merely link to the original source",
      "Summarizes the important parts",
      "Explains why the information matters",
      "Adds interpretation",
      "Connects the story to the reader",
      "Identifies implications",
      "Separates important information from unnecessary details",
      "Provides an editorial opinion where appropriate",
      "Helps the reader understand rather than simply consume",
    ],
  },
  {
    key: "originality",
    label: "Originality & Information Value",
    weight: 0.09,
    coreQuestion: "Did I learn something I didn't already know?",
    criteria: [
      "Contains new information",
      "Provides a non-obvious perspective",
      "Avoids repeating commonly known information",
      "Introduces useful data, examples, research, or evidence",
      "Gives the reader something they are unlikely to encounter elsewhere",
      "Has a clear \"I didn't know that\" moment",
    ],
  },
  {
    key: "depth_substance",
    label: "Depth & Substance",
    weight: 0.09,
    coreQuestion: "Does this go beyond surface-level information?",
    criteria: [
      "Explains the \"what\"",
      "Explains the \"why\"",
      "Explains the \"so what\"",
      "Provides sufficient context",
      "Doesn't oversimplify important issues",
      "Uses specific examples",
      "Avoids shallow commentary",
      "Depth is appropriate for the format",
    ],
  },
  {
    key: "accuracy_credibility",
    label: "Accuracy & Credibility",
    weight: 0.09,
    coreQuestion: "Can I trust what I'm being told?",
    criteria: [
      "Claims are factually accurate",
      "Numbers and statistics are correct",
      "Sources are credible",
      "Primary sources are used where appropriate",
      "Claims can be verified",
      "Sources are clearly attributed",
      "Quotes are accurate",
      "Context isn't misleading",
      "Opinions are distinguishable from facts",
    ],
  },
  {
    key: "actionability",
    label: "Actionability / Practical Value",
    weight: 0.09,
    coreQuestion: "Can I do something useful with this?",
    criteria: [
      "Provides a useful next step",
      "Gives practical advice",
      "Provides a framework",
      "Includes tools/resources",
      "Gives examples of implementation",
      "Helps the reader make a decision",
      "Makes the information usable",
    ],
  },
  {
    key: "readability_structure",
    label: "Readability & Content Structure",
    weight: 0.05,
    coreQuestion: "Can I understand this quickly without working hard?",
    criteria: [
      "Strong opening",
      "Clear hierarchy",
      "Logical progression",
      "Short, readable paragraphs",
      "Good use of headings",
      "Appropriate use of bullets",
      "Effective formatting",
      "Easy to scan",
      "No unnecessary repetition",
      "Appropriate reading length",
    ],
  },
  {
    key: "narrative_engagement",
    label: "Narrative / Engagement Quality",
    weight: 0.05,
    coreQuestion: "Did this make me want to keep reading?",
    criteria: [
      "Creates curiosity",
      "Maintains attention",
      "Has momentum",
      "Uses examples or storytelling effectively",
      "Creates an emotional or intellectual reaction",
      "Makes the reader want to continue",
      "Ends sections effectively",
    ],
  },
  {
    key: "curation_coherence",
    label: "Curation & Newsletter Coherence",
    weight: 0.05,
    coreQuestion: "Does this feel like one intelligently edited publication?",
    criteria: [
      "Stories complement each other",
      "There's an intentional hierarchy",
      "The most important content appears first",
      "Sections feel connected",
      "Content doesn't feel randomly assembled",
      "The edition has a clear editorial identity",
      "There's an appropriate balance between important and lighter content",
      "The newsletter feels like a curated package rather than an RSS feed",
    ],
  },
  {
    key: "voice_brand_fit",
    label: "Voice & Brand Fit",
    weight: 0.04,
    coreQuestion: "Could I recognize this newsletter without seeing its name?",
    criteria: [
      "Consistent with the newsletter's voice",
      "Has a recognizable personality",
      "Tone fits the audience",
      "Writing feels human",
      "Avoids generic AI-sounding language",
      "Maintains editorial consistency",
      "Strengthens the newsletter's positioning",
    ],
  },
  {
    key: "memorability",
    label: "Memorability",
    weight: 0.03,
    coreQuestion: "What will I remember tomorrow?",
    criteria: [
      "Contains a memorable insight",
      "Uses strong examples",
      "Has quotable ideas",
      "Uses effective analogies",
      "Gives the reader something worth sharing",
      "Leaves a clear takeaway",
    ],
  },
];

export interface ContentQualityCategoryResult {
  key: ContentQualityCategoryKey;
  label: string;
  weight: number;
  /** 0-5, or null when the LLM judged this category N/A for this edition. */
  score: number | null;
  /** This category's actual contribution to the 100-point total, after N/A
   * weight redistribution — null categories always show 0 here. */
  effectiveWeight: number;
  justification: string;
}

export interface ContentQualityResult {
  total: number; // 0-100
  categories: ContentQualityCategoryResult[];
  narrative: string;
}

/**
 * Takes raw 0-5 (or null/N/A) scores per category and computes the final
 * 0-100 total, excluding N/A categories from the denominator and
 * redistributing their weight proportionally across the remaining
 * categories — exactly the rule the checklist specifies. Done in our own
 * code rather than trusted to the LLM's arithmetic.
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

/** System prompt embedding the full rubric, sent once per scoring call. */
export function buildContentQualitySystemPrompt(): string {
  const categoryBlocks = CONTENT_QUALITY_CATEGORIES.map(
    (c) =>
      `### ${c.label} (weight: ${Math.round(c.weight * 100)}%)\nCore question: ${c.coreQuestion}\nCriteria:\n${c.criteria
        .map((crit) => `- ${crit}`)
        .join("\n")}`,
  ).join("\n\n");

  return `You are an editorial quality analyst scoring a single newsletter edition against a fixed 12-category checklist. Score every applicable category from 0-5 (0 = Missing/Very Poor, 1 = Weak, 2 = Below Average, 3 = Good, 4 = Very Good, 5 = Exceptional). If a category genuinely does not apply to this edition's format, return null for its score and explain why in the justification — do not force a score.

Evaluate ONLY the editorial content quality itself. Do not consider or infer anything about open rates, click rates, poll responses, unsubscribe rates, or any other engagement/performance metric — none of that is available to you and none of it is a valid signal of content quality per this framework.

${categoryBlocks}

For each category, give a 0-5 score (or null for N/A) and a one-to-two sentence justification grounded in the actual text. Then write one short overall narrative paragraph (2-3 sentences) summarizing the edition's editorial strengths and weaknesses.`;
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
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            key: {
              type: "string",
              enum: CONTENT_QUALITY_CATEGORIES.map((c) => c.key),
            },
            score: { type: ["integer", "null"], minimum: 0, maximum: 5 },
            justification: { type: "string" },
          },
          required: ["key", "score", "justification"],
        },
        minItems: CONTENT_QUALITY_CATEGORIES.length,
        maxItems: CONTENT_QUALITY_CATEGORIES.length,
      },
      narrative: { type: "string" },
    },
    required: ["categories", "narrative"],
  },
} as const;
