/**
 * Hook to read the current AI provider configuration from localStorage.
 * Used by all modules that need to call AI edge functions.
 */

const STORAGE_KEY = "conexao_ai_provider_config";

export interface AIProviderConfig {
  providerId: string;
  model: string;
}

interface StoredConfig {
  mode: "manual" | "alternating";
  activeProviderId: string;
  activeModel: string;
  enabledProviders: string[];
  alternatingInterval: number;
  requestCount: number;
  currentRotationIndex: number;
}

const PROVIDER_MODELS: Record<string, string> = {
  lovable: "google/gemini-2.5-flash",
  gemini: "google/gemini-3-flash-preview",
  openai: "openai/gpt-5-mini",
  abacus: "route-llm",
  anthropic: "claude-3-5-sonnet",
  groq: "llama-3.3-70b-versatile",
};

/**
 * Get the current AI provider config (can be used outside React components too)
 */
export function getAIProviderConfig(): AIProviderConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { providerId: "lovable", model: "google/gemini-2.5-flash" };
    }
    const config: StoredConfig = JSON.parse(stored);

    let providerId = config.activeProviderId || "lovable";
    let model = config.activeModel || "auto";

    // Round-robin mode
    if (config.mode === "alternating" && config.enabledProviders?.length > 1) {
      const idx = (config.requestCount || 0) % config.enabledProviders.length;
      providerId = config.enabledProviders[idx];
      model = PROVIDER_MODELS[providerId] || "auto";

      // Increment request count
      const updated = {
        ...config,
        requestCount: (config.requestCount || 0) + 1,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    // Resolve "auto" model
    if (model === "auto") {
      model = PROVIDER_MODELS[providerId] || "google/gemini-2.5-flash";
    }

    return { providerId, model };
  } catch {
    return { providerId: "lovable", model: "google/gemini-2.5-flash" };
  }
}
