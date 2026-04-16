export const PROVIDERS = {
  anthropic: {
    label: "Anthropic",
    baseURL: "https://api.anthropic.com/v1/messages",
    models: [
      { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
      { id: "claude-opus-4-5", label: "Claude Opus 4.5" },
      { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    ],
    buildRequest({ model, messages, system, temperature, topP }) {
      return {
        url: this.baseURL,
        headers: (apiKey) => ({
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        }),
        body: {
          model,
          max_tokens: 1024,
          stream: true,
          messages,
          ...(system ? { system } : {}),
          ...(temperature !== undefined ? { temperature } : {}),
          ...(topP !== undefined ? { top_p: topP } : {}),
        },
      };
    },
    // Anthropic uses content_block_delta events
    parseDelta(parsed) {
      if (parsed.type === "content_block_delta" && parsed.delta?.text) {
        return parsed.delta.text;
      }
      return null;
    },
  },

  openai: {
    label: "OpenAI",
    baseURL: "https://api.openai.com/v1/chat/completions",
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { id: "o3-mini", label: "o3-mini" },
    ],
    buildRequest({ model, messages, system, temperature, topP }) {
      const msgs = system
        ? [{ role: "system", content: system }, ...messages]
        : messages;
      return {
        url: this.baseURL,
        headers: (apiKey) => ({
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        }),
        body: {
          model,
          stream: true,
          messages: msgs,
          ...(temperature !== undefined ? { temperature } : {}),
          ...(topP !== undefined ? { top_p: topP } : {}),
        },
      };
    },
    // OpenAI uses choices[0].delta.content
    parseDelta(parsed) {
      return parsed.choices?.[0]?.delta?.content ?? null;
    },
  },

  groq: {
    label: "Groq",
    baseURL: "https://api.groq.com/openai/v1/chat/completions",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B" },
      { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
      { id: "gemma2-9b-it", label: "Gemma 2 9B" },
    ],
    buildRequest({ model, messages, system, temperature, topP }) {
      // Groq is OpenAI-compatible
      const msgs = system
        ? [{ role: "system", content: system }, ...messages]
        : messages;
      return {
        url: this.baseURL,
        headers: (apiKey) => ({
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        }),
        body: {
          model,
          stream: true,
          messages: msgs,
          ...(temperature !== undefined ? { temperature } : {}),
          ...(topP !== undefined ? { top_p: topP } : {}),
        },
      };
    },
    parseDelta(parsed) {
      return parsed.choices?.[0]?.delta?.content ?? null;
    },
  },

  gemini: {
    label: "Google Gemini",
    // Gemini uses a different REST shape — key goes in the URL, not a header
    baseURL: "https://generativelanguage.googleapis.com/v1beta/models",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    ],
    buildRequest({ model, messages, system, temperature, topP }) {
      // Convert role:user/assistant → role:user/model for Gemini
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      return {
        // URL is dynamic — resolved in buildUrl()
        url: null,
        buildUrl: (apiKey) =>
          `${this.baseURL}/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        headers: () => ({ "Content-Type": "application/json" }),
        body: {
          contents,
          ...(system
            ? { systemInstruction: { parts: [{ text: system }] } }
            : {}),
          generationConfig: {
            ...(temperature !== undefined ? { temperature } : {}),
            ...(topP !== undefined ? { topP } : {}),
          },
        },
      };
    },
    parseDelta(parsed) {
      return parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    },
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);

export function getProvider(id) {
  return PROVIDERS[id] || PROVIDERS.anthropic;
}
