import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGuardianReport, formatGuardianReport } from './report';

const ROOT = path.join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const REVIEWS_DIR = path.join(ROOT, 'docs', 'reviews');

function readVersion(): string {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as { version: string };
  return pkg.version;
}

function main(): void {
  const version = readVersion();
  const report = buildGuardianReport(version);
  const markdown = formatGuardianReport(report);
  const stamp = new Date().toISOString().slice(0, 10);
  const outputPath = path.join(REVIEWS_DIR, `GUARDIAN_REPORT_${stamp}.md`);

  fs.mkdirSync(REVIEWS_DIR, { recursive: true });
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log(markdown);
  console.log(`\nSaved: ${path.relative(ROOT, outputPath)}`);
}

main();
