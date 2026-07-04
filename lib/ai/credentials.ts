export function readGeminiApiKey(): string | undefined {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
}

export function readRequestyApiKey(): string | undefined {
  return process.env.REQUESTY_API_KEY?.trim() || undefined;
}

export function readGroqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY?.trim() || undefined;
}
