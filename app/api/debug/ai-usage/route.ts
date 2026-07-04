import { getDailyUsage, GROQ_LLAMA_33_70B_PRICING, USD_TO_EUR } from '../../../../lib/ai/costEstimate';

export async function GET() {
  const daily = getDailyUsage();

  return Response.json({
    status: 'ok',
    pricing: {
      provider: 'groq',
      model: GROQ_LLAMA_33_70B_PRICING.model,
      inputUsdPerMillion: GROQ_LLAMA_33_70B_PRICING.inputUsdPerMillion,
      outputUsdPerMillion: GROQ_LLAMA_33_70B_PRICING.outputUsdPerMillion,
      usdToEur: USD_TO_EUR,
      sourceUrl: GROQ_LLAMA_33_70B_PRICING.sourceUrl,
      verifiedAt: GROQ_LLAMA_33_70B_PRICING.verifiedAt
    },
    daily
  });
}
