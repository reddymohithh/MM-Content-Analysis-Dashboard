import "server-only";
import { getConfiguredLlmProvider, getConfiguredLlmModel } from "@/lib/llm";
import {
  CONTENT_QUALITY_CATEGORIES,
  CONTENT_QUALITY_JSON_SCHEMA,
  buildContentQualitySystemPrompt,
  computeContentQualityTotal,
  type AudienceFeedback,
  type ContentQualityCategoryKey,
  type ContentQualityResult,
} from "./content-quality";

interface LlmCategoryResponse {
  key: ContentQualityCategoryKey;
  score: number | null;
  justification: string;
}

interface LlmResponse {
  categories: LlmCategoryResponse[];
  batch1: AudienceFeedback;
  batch2: AudienceFeedback;
}

export interface ScoredContentQuality extends ContentQualityResult {
  provider: string;
  model: string;
}

/** The site never renders em/en dashes; the checklist system prompt is
 * passed to the LLM verbatim and deliberately carries no style instruction
 * of our own, so any dash the model produces is normalized here instead,
 * after the fact, rather than by editing the checklist text. */
function stripDashes(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ", ").replace(/,\s*,/g, ",");
}

function cleanFeedback(f: AudienceFeedback): AudienceFeedback {
  return { narrative: stripDashes(f.narrative), tips: f.tips.map(stripDashes) };
}

/** Runs one edition's content through the configured LLM against the
 * editorial checklist. Throws on any provider/parsing failure — callers
 * decide how to handle a failed edition (skip and continue, in the refresh
 * route). */
export async function scoreEditionContentQuality(
  subject: string,
  content: string,
): Promise<ScoredContentQuality> {
  const provider = getConfiguredLlmProvider();
  const model = getConfiguredLlmModel();

  const response = await provider.completeStructured<LlmResponse>({
    model,
    systemPrompt: buildContentQualitySystemPrompt(),
    userPrompt: `Subject line: ${subject}\n\nEdition content:\n${content}`,
    jsonSchema: CONTENT_QUALITY_JSON_SCHEMA,
  });

  const keysReturned = new Set(response.categories.map((c) => c.key));
  const missing = CONTENT_QUALITY_CATEGORIES.filter((c) => !keysReturned.has(c.key));
  if (missing.length > 0) {
    throw new Error(
      `LLM response missing categories: ${missing.map((c) => c.key).join(", ")}`,
    );
  }

  const { total, categories } = computeContentQualityTotal(
    response.categories.map((c) => ({ ...c, justification: stripDashes(c.justification) })),
  );

  return {
    total,
    categories,
    batch1: cleanFeedback(response.batch1),
    batch2: cleanFeedback(response.batch2),
    provider: provider.id,
    model,
  };
}
