/**
 * Subject-line tagging for the Subject Line Lab.
 *
 * Character length, emoji presence, and number presence are computed
 * directly from the real subject-line string (no placeholder involved).
 *
 * Hook-type classification is a rule-based heuristic against the six
 * categories in docs/PROJECT_SPEC.md (curiosity gap, number contrast,
 * name-drop, contrarian claim, personal risk/fear framing, direct
 * stake-the-ground). This is a placeholder pending real NLP/LLM
 * classification, the same status as the voice-compliance score (see
 * BUILD_LOG.md) — it is a reasonable first pass, not a hand-tagged or
 * fabricated label.
 */

export type HookType =
  | "curiosity_gap"
  | "number_contrast"
  | "name_drop"
  | "contrarian"
  | "personal_risk"
  | "direct_stake";

export const HOOK_TYPE_LABELS: Record<HookType, string> = {
  curiosity_gap: "Curiosity gap",
  number_contrast: "Number contrast",
  name_drop: "Name-drop",
  contrarian: "Contrarian claim",
  personal_risk: "Personal risk or fear",
  direct_stake: "Direct stake-the-ground",
};

const KNOWN_BRANDS = [
  "google",
  "meta",
  "facebook",
  "openai",
  "chatgpt",
  "claude",
  "anthropic",
  "microsoft",
  "amazon",
  "apple",
  "tiktok",
  "instagram",
  "linkedin",
  "coca-cola",
  "nielsen",
  "netflix",
  "spotify",
  "salesforce",
  "hubspot",
];

const RISK_WORDS = [
  "risk",
  "warning",
  "losing",
  "lost",
  "broke",
  "broken",
  "danger",
  "threat",
  "scared",
  "afraid",
  "mistake",
  "wrong move",
  "quietly",
];

const CONTRARIAN_WORDS = [
  "not ",
  "isn't",
  "aren't",
  "myth",
  "actually",
  "stop ",
  "wrong",
  "skip",
  "won't",
  "doesn't",
];

const CURIOSITY_PATTERNS = [/\?/, /here'?s why/i, /the real reason/i, /what nobody/i, /nobody (talks|announced)/i];

export function classifyHookType(subject: string): HookType {
  const text = subject.toLowerCase();

  if (RISK_WORDS.some((w) => text.includes(w))) return "personal_risk";
  if (/\d/.test(subject) && (/[%$]/.test(subject) || /\b\d+[kmb]?\b/i.test(subject))) {
    return "number_contrast";
  }
  if (KNOWN_BRANDS.some((b) => text.includes(b))) return "name_drop";
  if (CONTRARIAN_WORDS.some((w) => text.includes(w))) return "contrarian";
  if (CURIOSITY_PATTERNS.some((p) => p.test(subject))) return "curiosity_gap";
  return "direct_stake";
}

export function subjectCharLength(subject: string): number {
  return subject.length;
}

export function subjectHasNumber(subject: string): boolean {
  return /\d/.test(subject);
}

const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;

export function subjectHasEmoji(subject: string): boolean {
  return EMOJI_PATTERN.test(subject);
}
