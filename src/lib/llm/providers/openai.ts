import OpenAI from "openai";
import type { LlmProvider, StructuredCompletionRequest } from "../types";

export function createOpenAiProvider(): LlmProvider {
  return {
    id: "openai",
    async completeStructured<T>(request: StructuredCompletionRequest): Promise<T> {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "OPENAI_API_KEY is not set. Add it to .env.local to run content-quality scoring.",
        );
      }
      const client = new OpenAI({ apiKey });

      const response = await client.chat.completions.create({
        model: request.model,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: request.jsonSchema.name,
            strict: request.jsonSchema.strict,
            schema: request.jsonSchema.schema as Record<string, unknown>,
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("OpenAI returned an empty response for a structured completion request.");
      }
      return JSON.parse(content) as T;
    },
  };
}
