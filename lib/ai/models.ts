export const GROQ_DEFAULT_MODEL = "openai/gpt-oss-120b";
export const GROQ_FALLBACK_MODEL = "qwen/qwen3.6-27b";
export const DEPRECATED_GROQ_MODELS = ["llama-3.3-70b-versatile"] as const;
export const GROQ_DEPRECATION_SHUTDOWN_DATE = "2026-08-16";
export const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

type ModelSource = "default" | "env" | "explicit";

export type CloudModelSelection = {
  provider?: string;
  model: string;
  modelSource: ModelSource;
  defaultModel: string;
  recommendedModel?: string;
  fallbackModel?: string;
  deprecatedModels?: readonly string[];
  deprecationShutdownDate?: string;
  isDeprecated: boolean;
};

export function getDefaultCloudModel(provider?: string) {
  return provider === "groq" ? GROQ_DEFAULT_MODEL : OPENAI_DEFAULT_MODEL;
}

export function isDeprecatedGroqModel(model?: string | null) {
  return DEPRECATED_GROQ_MODELS.includes(model as typeof DEPRECATED_GROQ_MODELS[number]);
}

export function getCloudModelSelection(
  provider?: string,
  configuredModel?: string | null,
  configuredModelSource: Exclude<ModelSource, "default"> = "env",
): CloudModelSelection {
  const defaultModel = getDefaultCloudModel(provider);
  const model = configuredModel || defaultModel;
  const modelSource: ModelSource = configuredModel ? configuredModelSource : "default";
  const isGroq = provider === "groq";
  const isDeprecated = isGroq && isDeprecatedGroqModel(model);

  return {
    provider,
    model,
    modelSource,
    defaultModel,
    recommendedModel: isGroq ? GROQ_DEFAULT_MODEL : defaultModel,
    fallbackModel: isGroq ? GROQ_FALLBACK_MODEL : undefined,
    deprecatedModels: isGroq ? DEPRECATED_GROQ_MODELS : undefined,
    deprecationShutdownDate: isDeprecated ? GROQ_DEPRECATION_SHUTDOWN_DATE : undefined,
    isDeprecated,
  };
}

export function getDeprecatedGroqModelWarning(selection: CloudModelSelection) {
  if (!selection.isDeprecated) return undefined;

  const configuredAs = selection.modelSource === "env" ? "AI_MODEL" : "model override";
  return `${configuredAs}=${selection.model} is a deprecated Groq model and will stop serving requests after ${GROQ_DEPRECATION_SHUTDOWN_DATE}. Use ${GROQ_DEFAULT_MODEL}; fallback: ${GROQ_FALLBACK_MODEL}.`;
}

export function warnIfDeprecatedGroqModel(selection: CloudModelSelection, context: string) {
  const warning = getDeprecatedGroqModelWarning(selection);
  if (warning) console.warn(`[${context}] ${warning}`);
  return warning;
}
