import "server-only";
import type { LlmProvider } from "./types";
import { createOpenAiProvider } from "./providers/openai";

/**
 * Which model actually runs content-quality scoring is entirely env-var
 * driven — CONTENT_QUALITY_LLM_PROVIDER picks the adapter,
 * CONTENT_QUALITY_LLM_MODEL picks the model string passed to it. Defaults to
 * OpenAI's gpt-5.6-luna per the user's initial choice, but switching to any
 * other OpenAI model (or, once a new adapter file exists, any other
 * provider entirely) never touches the scoring pipeline itself.
 */
export function getConfiguredLlmProvider(): LlmProvider {
  const providerId = process.env.CONTENT_QUALITY_LLM_PROVIDER ?? "openai";
  switch (providerId) {
    case "openai":
      return createOpenAiProvider();
    default:
      throw new Error(
        `Unknown CONTENT_QUALITY_LLM_PROVIDER "${providerId}". Add a new adapter in src/lib/llm/providers/ implementing LlmProvider, then handle it here.`,
      );
  }
}

export function getConfiguredLlmModel(): string {
  return process.env.CONTENT_QUALITY_LLM_MODEL ?? "gpt-5.6-luna";
}

export type { LlmProvider } from "./types";
