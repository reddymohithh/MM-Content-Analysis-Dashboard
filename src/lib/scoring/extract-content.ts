import { convert } from "html-to-text";

/**
 * Beehiiv's free_web_content is a full HTML document (fonts, inline <style>
 * blocks, layout markup) — stripping it to plain text before it ever reaches
 * an LLM matters for both cost (style/markup boilerplate can dwarf the
 * actual copy) and quality (the model should read the edition, not CSS).
 */
export function extractPlainTextFromHtml(html: string): string {
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: "style", format: "skip" },
      { selector: "script", format: "skip" },
      { selector: "img", format: "skip" },
      { selector: "a", options: { ignoreHref: true } },
    ],
  })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
