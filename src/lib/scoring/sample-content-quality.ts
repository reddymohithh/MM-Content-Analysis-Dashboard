/**
 * Static, hand-written example of a scored edition — shown on the edition
 * detail page only when the real content-quality pipeline hasn't scored
 * that edition yet, clearly labeled as a preview so it's never mistaken for
 * a real result (BUILD_LOG.md). Deliberately edition-agnostic ("the piece",
 * "this story") rather than referencing any specific real edition's
 * content, since the same static sample renders on every unanalyzed
 * edition's page regardless of what that edition is actually about.
 *
 * Runs the real category scores through the same computeContentQualityTotal
 * weighting logic the live pipeline uses, so the total and per-category
 * effective weights shown are internally consistent with how a real score
 * would be computed, not hand-calculated.
 */

import { computeContentQualityTotal, type ContentQualityCategoryKey } from "./content-quality";
import type { StoredContentQualityScore } from "@/lib/data/editions";

const RAW_SCORES: { key: ContentQualityCategoryKey; score: number | null; justification: string }[] = [
  {
    key: "audience_relevance",
    score: 4,
    justification:
      "The piece speaks directly to the newsletter's usual reader and assumes the industry context they already have, without over-explaining basics.",
  },
  {
    key: "topic_selection",
    score: 4,
    justification:
      "A genuinely notable story with real stakes behind it, not a generic trend recap padded out to fill space.",
  },
  {
    key: "editorial_value_add",
    score: 3,
    justification:
      "Explains what happened and why it's notable, but stops short of connecting it to a broader pattern the reader could apply elsewhere.",
  },
  {
    key: "originality",
    score: 3,
    justification:
      "Covers ground other outlets likely reported the same week, with only a light original angle layered on top.",
  },
  {
    key: "depth_substance",
    score: 2,
    justification:
      "Stays mostly descriptive. The \"why now\" and \"so what\" angles are gestured at but not developed.",
  },
  {
    key: "accuracy_credibility",
    score: 4,
    justification: "Claims are attributed to named sources and match the linked coverage.",
  },
  {
    key: "actionability",
    score: 2,
    justification: "Interesting to read, but leaves the reader without a concrete takeaway to apply.",
  },
  {
    key: "readability_structure",
    score: 4,
    justification: "Short, well-paced paragraphs with a strong, specific opening line.",
  },
  {
    key: "narrative_engagement",
    score: 4,
    justification:
      "The premise itself carries curiosity through to the end without needing much editorial embellishment.",
  },
  {
    key: "curation_coherence",
    score: 3,
    justification: "Fits its slot in the edition, but the transition from the lead story feels abrupt.",
  },
  {
    key: "voice_brand_fit",
    score: 4,
    justification:
      "Specific, opinionated phrasing consistent with the newsletter's usual tone rather than generic trade-press language.",
  },
  {
    key: "memorability",
    score: 4,
    justification: "One detail in the piece is genuinely quotable and likely to stick with the reader.",
  },
];

const { total, categories } = computeContentQualityTotal(RAW_SCORES);

export const SAMPLE_CONTENT_QUALITY: StoredContentQualityScore = {
  total,
  categories,
  narrative:
    "This example edition would score well on voice, readability, and memorability thanks to a well-told, specific story, but would leave real points on the table in depth and actionability. It describes what happened clearly and entertainingly without pushing into why it matters more broadly or what a reader should do with that insight.",
  tips: [
    "Add one paragraph connecting the story to a broader pattern, so readers leave with a transferable idea rather than just an update.",
    "Close on a specific, applicable takeaway for the reader instead of ending on the story detail alone.",
  ],
  provider: "example",
  model: "Sample only, not yet scored",
  scoredAt: new Date(),
};
