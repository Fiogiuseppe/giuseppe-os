import { readKnowledge } from '../../../../src/modules/intelligence/read/intelligence-read.server';
import { parseIntelligenceKnowledgeQuery } from '../../../../src/modules/intelligence/read/intelligence-read.types';

/** Intelligence read layer — safe knowledge metadata only. No LLM. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = parseIntelligenceKnowledgeQuery(searchParams);

  if (!query) {
    return Response.json({ error: 'Invalid knowledge query parameters.' }, { status: 400 });
  }

  const result = await readKnowledge(query);

  return Response.json(result);
}
