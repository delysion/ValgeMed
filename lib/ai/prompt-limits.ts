export const DEFAULT_AI_PROMPT_LIMIT_CHARS = 24_000;
export const MIN_AI_PROMPT_LIMIT_CHARS = 1_000;
export const MAX_AI_PROMPT_LIMIT_CHARS = 500_000;
export const DEFAULT_AI_DAILY_REQUEST_LIMIT = 40;
export const MIN_AI_DAILY_REQUEST_LIMIT = 1;
export const MAX_AI_DAILY_REQUEST_LIMIT = 500;
export const DEFAULT_AI_DAILY_CHAR_LIMIT = 240_000;
export const MIN_AI_DAILY_CHAR_LIMIT = 10_000;
export const MAX_AI_DAILY_CHAR_LIMIT = 2_000_000;

export function normalizeAiPromptLimit(value: unknown) {
  const numeric = typeof value === "string" ? Number(value) : Number(value);

  if (!Number.isFinite(numeric)) {
    return DEFAULT_AI_PROMPT_LIMIT_CHARS;
  }

  return Math.min(
    MAX_AI_PROMPT_LIMIT_CHARS,
    Math.max(MIN_AI_PROMPT_LIMIT_CHARS, Math.round(numeric))
  );
}

export function boundPrompt(prompt: string, limit?: unknown) {
  const promptLimitChars = normalizeAiPromptLimit(limit);

  if (prompt.length <= promptLimitChars) {
    return prompt;
  }

  return `${prompt.slice(0, promptLimitChars)}\n\n[Input truncated to keep AI provider usage bounded.]`;
}

export function normalizeAiDailyRequestLimit(value: unknown) {
  const numeric = typeof value === "string" ? Number(value) : Number(value);

  if (!Number.isFinite(numeric)) {
    return DEFAULT_AI_DAILY_REQUEST_LIMIT;
  }

  return Math.min(
    MAX_AI_DAILY_REQUEST_LIMIT,
    Math.max(MIN_AI_DAILY_REQUEST_LIMIT, Math.round(numeric)),
  );
}

export function normalizeAiDailyCharLimit(value: unknown, promptLimit?: unknown) {
  const numeric = typeof value === "string" ? Number(value) : Number(value);
  const minimumUsefulLimit = Math.max(
    MIN_AI_DAILY_CHAR_LIMIT,
    normalizeAiPromptLimit(promptLimit),
  );

  if (!Number.isFinite(numeric)) {
    return Math.max(DEFAULT_AI_DAILY_CHAR_LIMIT, minimumUsefulLimit);
  }

  return Math.min(
    MAX_AI_DAILY_CHAR_LIMIT,
    Math.max(minimumUsefulLimit, Math.round(numeric)),
  );
}
