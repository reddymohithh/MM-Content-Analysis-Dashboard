/**
 * Provider-agnostic LLM interface. Every adapter (openai.ts today; anthropic
 * .ts or others later) implements this same shape, so swapping models is an
 * env-var change (CONTENT_QUALITY_LLM_PROVIDER / CONTENT_QUALITY_LLM_MODEL)
 * and adding a wholly new provider is "write one file that implements this
 * interface," not a rewrite of the scoring pipeline.
 */

export interface StructuredCompletionRequest {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  /** JSON Schema (OpenAI "strict" structured-output style) describing the
   * required response shape. Every provider adapter is responsible for
   * translating this into whatever its own API expects. */
  jsonSchema: { name: string; strict: boolean; schema: unknown };
}

export interface LlmProvider {
  id: string;
  /** Returns the parsed JSON object matching jsonSchema. Throws on any
   * non-conforming or failed response rather than returning partial data. */
  completeStructured<T>(request: StructuredCompletionRequest): Promise<T>;
}
