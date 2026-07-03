import { readFile } from 'fs/promises';
import path from 'path';

const CONSTITUTION_PATH = path.join(process.cwd(), 'docs', 'PRODUCT_CONSTITUTION.md');

export async function loadConstitutionExcerpt(): Promise<string> {
  try {
    const raw = await readFile(CONSTITUTION_PATH, 'utf8');
    return raw.replace(/^#+\s/gm, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, 2400);
  } catch {
    return 'Constitution unavailable.';
  }
}
