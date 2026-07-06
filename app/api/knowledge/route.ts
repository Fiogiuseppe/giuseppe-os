import { listSafeKnowledgeItems } from '../../../src/modules/knowledge/services/knowledge.server';

/** Safe knowledge metadata — no raw provider payloads or secrets. */
export async function GET() {
  const items = await listSafeKnowledgeItems();

  return Response.json({
    items,
    updatedAt: new Date().toISOString()
  });
}
