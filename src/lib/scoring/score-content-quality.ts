import "server-only";
import { getConfiguredLlmProvider, getConfiguredLlmModel } from "@/lib/llm";
import {
  CONTENT_QUALITY_CATEGORIES,
  CONTENT_QUALITY_JSON_SCHEMA,
  buildContentQualitySystemPrompt,
  computeContentQualityTotal,
  classifyContentQuality,
  type ContentQualityCategoryKey,
  type ContentQualityResult,
} from "./content-quality";

interface LlmCategoryResponse {
  key: ContentQualityCategoryKey;
  score: number | null;
  justification: string;
}

/** Everything CONTENT_QUALITY_JSON_SCHEMA asks for besides categories
 * (total/classification are computed, not asked). */
type LlmResponse = Omit<ContentQualityResult, "total" | "classification" | "categories"> & {
  categories: LlmCategoryResponse[];
};

export interface ScoredContentQuality extends ContentQualityResult {
  provider: string;
  model: string;
}

/** The site never renders em/en dashes; the checklist system prompt is
 * passed to the LLM verbatim and deliberately carries no style instruction
 * of our own, so any dash the model produces is normalized here instead,
 * after the fact, rather than by editing the checklist text. Walks the
 * entire response recursively rather than touching each of the schema's
 * several dozen string fields by hand. */
function stripDashesDeep<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\s*[—–]\s*/g, ", ").replace(/,\s*,/g, ",") as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(stripDashesDeep) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stripDashesDeep(v);
    }
    return out as T;
  }
  return value;
}

/** Runs one edition's content through the configured LLM against the full
 * editorial checklist (global-content-analysis-checklist.md, Section 23's
 * complete required output). Throws on any provider/parsing failure —
 * callers decide how to handle a failed edition (skip and continue, in the
 * refresh route). */
export async function scoreEditionContentQuality(
  subject: string,
  content: string,
): Promise<ScoredContentQuality> {
  const provider = getConfiguredLlmProvider();
  const model = getConfiguredLlmModel();

  const raw = await provider.completeStructured<LlmResponse>({
    model,
    systemPrompt: buildContentQualitySystemPrompt(),
    userPrompt: `Subject line: ${subject}\n\nEdition content:\n${content}`,
    jsonSchema: CONTENT_QUALITY_JSON_SCHEMA,
  });

  const response = stripDashesDeep(raw);

  const keysReturned = new Set(response.categories.map((c) => c.key));
  const missing = CONTENT_QUALITY_CATEGORIES.filter((c) => !keysReturned.has(c.key));
  if (missing.length > 0) {
    throw new Error(
      `LLM response missing categories: ${missing.map((c) => c.key).join(", ")}`,
    );
  }

  const { total, categories } = computeContentQualityTotal(response.categories);

  return {
    ...response,
    total,
    classification: classifyContentQuality(total),
    categories,
    provider: provider.id,
    model,
  };
}
