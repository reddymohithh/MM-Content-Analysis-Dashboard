/**
 * Static, hand-written example of a scored edition — shown on the edition
 * detail page only when the real content-quality pipeline hasn't scored
 * that edition yet, clearly labeled as a preview so it's never mistaken for
 * a real result (BUILD_LOG.md). Deliberately edition-agnostic ("the piece",
 * "this story") rather than referencing any specific real edition's
 * content, since the same static sample renders on every unanalyzed
 * edition's page regardless of what that edition is actually about.
 *
 * Covers the full Section 23 output shape (audience fit, reader outcome,
 * story-by-story, cross-batch feedback, improvement plan, and so on), not
 * just the category scores, since that's the whole point of the preview:
 * showing what the real feature will produce once scored.
 *
 * Runs the real category scores through the same computeContentQualityTotal
 * weighting logic the live pipeline uses, so the total and per-category
 * effective weights shown are internally consistent with how a real score
 * would be computed, not hand-calculated.
 */

import {
  computeContentQualityTotal,
  classifyContentQuality,
  type ContentQualityCategoryKey,
} from "./content-quality";
import type { StoredContentQualityScore } from "@/lib/data/editions";

const RAW_SCORES: {
  key: ContentQualityCategoryKey;
  score: number | null;
  justification: string;
  practitionersScore?: number | null;
  leadershipScore?: number | null;
}[] = [
  {
    key: "audience_relevance",
    score: 4, // Combined (Section 7.1) -- this is what feeds the weighted total, same as any other category
    justification:
      "The piece speaks directly to the newsletter's usual reader and assumes the industry context they already have, without over-explaining basics.",
    practitionersScore: 4,
    leadershipScore: 3,
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
  classification: classifyContentQuality(total),
  categories,
  verdict:
    "This example edition is clearly written and well-paced, but stays descriptive where a sharper interpretation or a concrete next step would make it genuinely differentiated.",
  audienceFit: {
    practitioners: {
      score: 3,
      assessment: "Gives practitioners a clear update but not a new technique or tool to apply this week.",
    },
    leadership: {
      score: 3,
      assessment: "Explains the development but leaves the strategic or budget-level implication implicit.",
    },
    combined: {
      score: 3,
      assessment: "Serviceable for both audiences without being distinctly strong for either.",
      classification: "Adequate for both",
    },
  },
  readerOutcome: {
    industryAwareness: { score: 4, assessment: "Reader clearly understands what changed and why it's notable." },
    upskilling: { score: 2, assessment: "No new resource, framework, or example the reader could learn from." },
    practicalExperimentation: {
      score: 2,
      assessment: "Nothing concrete for the reader to test, try, or investigate.",
    },
  },
  storyByStory: [
    {
      title: "Example: the edition's lead story",
      contentType: "News",
      primaryAudience: "Both",
      storyQualityScore: 68,
      whySelected: "Timely and significant enough that most readers would expect to see it covered.",
      whatMarketingMonkAdded: "A summary and brief explanation of why it matters, but little original framing.",
      whatReaderLearns: "What happened and roughly why it's notable.",
      practicalOpportunity: "Not applicable, this item is informational rather than actionable.",
      curationNecessity: 5,
      mainWeakness: "Stops at description instead of interpretation.",
    },
    {
      title: "Example: a secondary item further down the edition",
      contentType: "Resource",
      primaryAudience: "Practitioners",
      storyQualityScore: 74,
      whySelected: "A genuinely useful resource for the practitioner audience.",
      whatMarketingMonkAdded: "Context on when and why to use it.",
      whatReaderLearns: "A specific tool or resource worth trying.",
      practicalOpportunity: "Reader could try the resource this week.",
      curationNecessity: 6,
      mainWeakness: "No example of it being used in practice.",
    },
  ],
  whatWorked: [
    "Strong, specific opening on the lead story.",
    "Consistent, recognizable voice throughout.",
    "A genuinely useful resource surfaced for practitioners.",
  ],
  whatDidntWork: [
    "The lead story stays descriptive rather than interpretive.",
    "No edition-level practical takeaway for either audience.",
    "Transition between the lead story and secondary items feels abrupt.",
  ],
  biggestMissedOpportunity:
    "The lead story could have closed with a specific implication or action instead of ending on the news itself.",
  batch1: {
    overallFeedback:
      "For a practitioner reader, this example edition gives a clear, well-told update but stops short of a concrete next step. It would help someone stay current without necessarily giving them something new to try this week.",
    whatWereDoingRight: [
      "Explanations are clear and appropriately calibrated for 2-5 years of experience.",
      "The resource item gives practitioners something concrete.",
      "Voice stays consistent and human throughout.",
    ],
    whatWeNeedToWorkOn: [
      "Add a practical experiment or checklist item practitioners could test.",
      "Close stories on an action, not just a fact.",
      "Name a concrete tool or resource more often.",
    ],
    whatShouldBeAdded: ["A short implementation guide tied to the lead story."],
    takeaway: "Close the lead story with one concrete, testable action for practitioners.",
  },
  batch2: {
    overallFeedback:
      "For a leadership reader, this example edition explains what happened clearly but leaves the strategic implication implicit. It reads as informative rather than as a signal a leader should act on.",
    whatWereDoingRight: [
      "Identifies a genuinely significant industry development.",
      "Sourcing is credible and clearly attributed.",
      "Tone fits a senior reader without being overly casual.",
    ],
    whatWeNeedToWorkOn: [
      "Add a sentence on budget, headcount, or vendor implications.",
      "Connect the story to a broader industry pattern.",
      "Distinguish meaningful trend from short-lived news more explicitly.",
    ],
    whatShouldBeAdded: ["A one-line 'what this means for marketing leaders' close."],
    takeaway: "Add one explicit strategic implication to the lead story's close.",
  },
  crossBatch: {
    audienceBalance: "Balanced",
    audienceBalanceExplanation:
      "Neither audience is clearly better served than the other; both get a clear update without a strong actionable or strategic hook.",
    sharedStrengths: ["Clear, well-paced writing.", "Credible, attributed sourcing."],
    sharedWeaknesses: ["Neither audience gets a concrete next step.", "Depth stays surface-level across items."],
    audienceConflict:
      "None significant this edition; the gap is depth for both audiences rather than a tradeoff between them.",
    recommendedBalance:
      "Keep the current mix of news and resource items, but close each with an audience-specific implication or action.",
  },
  recommendedImprovements: [
    "Close the lead story with a specific reader action, not just the news.",
    "Add one strategic implication sentence for leadership readers.",
    "Include a real-world example of the surfaced resource in use.",
  ],
  nextEditionPlan: [
    {
      priority: "P1",
      improvement: "Close the lead story with a concrete action or implication.",
      audience: "Both",
      whyItMatters: "Currently the strongest driver of actionability and depth scores.",
      expectedImpact: "Should lift actionability and depth scores meaningfully.",
    },
    {
      priority: "P2",
      improvement: "Add a real-world usage example to resource items.",
      audience: "Practitioners",
      whyItMatters: "Improves depth without adding length.",
      expectedImpact: "Modest lift to depth and originality.",
    },
    {
      priority: "P3",
      improvement: "Tighten the transition between the lead story and secondary items.",
      audience: "Both",
      whyItMatters: "Minor coherence gap noted in curation scoring.",
      expectedImpact: "Small lift to curation and coherence.",
    },
  ],
  contentOpportunities: [
    {
      opportunity: "A short implementation guide tied to the lead story's topic.",
      whyItMatters: "Would directly address the practical-experimentation gap.",
      bestAudience: "Practitioners",
      suggestedTreatment: "Guide",
    },
    {
      opportunity: "A budget or headcount angle on the same development.",
      whyItMatters: "Would give leadership readers a strategic hook currently missing.",
      bestAudience: "Leadership",
      suggestedTreatment: "Analysis",
    },
    {
      opportunity: "A follow-up case study once the story develops further.",
      whyItMatters: "Would deepen a topic already established with readers.",
      bestAudience: "Both",
      suggestedTreatment: "Case Study",
    },
  ],
  strengthsToPreserve: [
    "The consistent, specific-not-generic voice.",
    "Leading with the most significant, timely story.",
  ],
  criticalFailures: [],
  finalSummary: {
    biggestStrength: "Clear, confidently voiced writing that's easy to read quickly.",
    biggestWeakness: "Stories end on description rather than an action or implication.",
    singleMostValuableChange: "Close every major item with a concrete, audience-specific next step.",
    practitioners: {
      doingRight: "Explanations are clear and pitched at the right experience level.",
      shouldImprove: "Close stories on a testable action, not just a fact.",
      shouldAdd: "A short implementation guide tied to the lead story.",
      shouldPreserve: "The consistent, human voice.",
      highestImpactImprovement: "End the lead story with one concrete, same-week action.",
    },
    leadership: {
      doingRight: "Surfaces genuinely significant, credibly sourced developments.",
      shouldImprove: "Make the strategic or budget-level implication explicit.",
      shouldAdd: "A one-line 'what this means for marketing leaders' close.",
      shouldPreserve: "The senior-appropriate, non-tactical tone.",
      highestImpactImprovement: "Add one explicit strategic implication to the lead story.",
    },
    crossBatch: {
      balanced: "Yes, roughly balanced, neither audience is clearly better served.",
      nextEditionDifference: "Close every major item with an audience-specific implication or action.",
    },
  },
  provider: "example",
  model: "Sample only, not yet scored",
  scoredAt: new Date(),
};
