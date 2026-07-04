#!/usr/bin/env node

/**
 * Giuseppe OS Design Review Generator
 *
 * Produces docs/reviews/DESIGN_REVIEW_<version>.pdf with cover page,
 * full-page screenshots, and a summary page.
 *
 * Usage: npm run design:review
 */

import { chromium } from 'playwright';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REVIEWS_DIR = path.join(ROOT, 'docs', 'reviews');
const TMP_DIR = path.join(ROOT, '.design-review-tmp');
const DEPLOYMENT_URL = 'https://giuseppe-os.vercel.app';
const SERVER_PORT = 3456;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

const DESKTOP = { width: 1280, height: 720, label: '1280 × 720 (Desktop)' };
const MOBILE = { width: 390, height: 844, label: '390 × 844 (Mobile)' };

const SCREENS = [
  { name: 'Today', navId: 'today', viewport: DESKTOP },
  { name: 'Decisions', navId: 'decisions', viewport: DESKTOP },
  { name: 'Insights', navId: 'insights', viewport: DESKTOP },
  { name: 'Create', navId: 'create', viewport: DESKTOP },
  { name: 'Memory', navId: 'memory', viewport: DESKTOP },
  { name: 'Mobile Today', navId: 'today', viewport: MOBILE },
  { name: 'Mobile Decisions', navId: 'decisions', viewport: MOBILE }
];

const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;
const CREAM = rgb(247 / 255, 245 / 255, 232 / 255);
const BLACK = rgb(0, 0, 0);
const BLUE = rgb(0, 31 / 255, 1);

function run(command, options = {}) {
  try {
    const output = execSync(command, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });
    return { ok: true, output: output.trim() };
  } catch (error) {
    const stdout = error.stdout?.toString?.().trim() ?? '';
    const stderr = error.stderr?.toString?.().trim() ?? '';
    return { ok: false, output: [stdout, stderr].filter(Boolean).join('\n') };
  }
}

function readPackageVersion() {
  const pkg = JSON.parse(execSync('cat package.json', { cwd: ROOT, encoding: 'utf8' }));
  return pkg.version;
}

function gitValue(command) {
  return execSync(command, { cwd: ROOT, encoding: 'utf8' }).trim();
}

async function readSection(filePath, heading) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const marker = `## ${heading}`;
    const start = content.indexOf(marker);
    if (start === -1) return [];

    const rest = content.slice(start + marker.length);
    const end = rest.search(/\n## /);
    const section = end === -1 ? rest : rest.slice(0, end);

    return section
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\.\s/.test(line) || line.startsWith('- '))
      .map(line =>
        line
          .replace(/^\d+\.\s*/, '')
          .replace(/^\*\*([^*]+)\*\*.*/, '$1')
          .replace(/^-\s*/, '')
          .replace(/^\[.\]\s*/, '')
          .trim()
      )
      .filter(Boolean)
      .slice(0, 8);
  } catch {
    return [];
  }
}

async function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, res => {
          res.resume();
          if (res.statusCode && res.statusCode < 500) resolve();
          else reject(new Error(`status ${res.statusCode}`));
        });
        req.on('error', reject);
      });
      return;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error(`Server did not start at ${url}`);
}

function startServer() {
  const child = spawn('npm', ['run', 'start', '--', '-p', String(SERVER_PORT)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(SERVER_PORT) }
  });

  child.stdout.on('data', chunk => process.stdout.write(`[server] ${chunk}`));
  child.stderr.on('data', chunk => process.stderr.write(`[server] ${chunk}`));

  return child;
}

async function captureScreenshots(buildStatus, testStatus) {
  await fs.mkdir(TMP_DIR, { recursive: true });

  const browser = await chromium.launch();
  const captures = [];

  try {
    for (const screen of SCREENS) {
      const context = await browser.newContext({
        viewport: { width: screen.viewport.width, height: screen.viewport.height }
      });
      const page = await context.newPage();
      await page.goto(SERVER_URL, { waitUntil: 'networkidle' });
      await page.getByTestId(`nav-${screen.navId}`).click();
      await page.waitForTimeout(400);

      const fileName = `${screen.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      const filePath = path.join(TMP_DIR, fileName);
      await page.screenshot({ path: filePath, fullPage: false });

      captures.push({
        ...screen,
        filePath,
        buildStatus,
        testStatus
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  return captures;
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function drawCoverPage(pdf, meta) {
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: CREAM });
  page.drawRectangle({ x: 60, y: PAGE_HEIGHT - 48, width: 72, height: 3, color: BLUE });

  page.drawText('Giuseppe OS', {
    x: 60,
    y: PAGE_HEIGHT - 120,
    size: 36,
    font: fontBold,
    color: BLACK
  });

  page.drawText('Design Review', {
    x: 60,
    y: PAGE_HEIGHT - 155,
    size: 18,
    font,
    color: BLACK
  });

  const lines = [
    `Version: ${meta.version}`,
    `Date: ${meta.date}`,
    `Commit: ${meta.commit}`,
    `Branch: ${meta.branch}`
  ];

  let y = PAGE_HEIGHT - 220;
  for (const line of lines) {
    page.drawText(line, { x: 60, y, size: 12, font, color: BLACK });
    y -= 22;
  }

  page.drawText('Personal Decision Intelligence System — Five Questions', {
    x: 60,
    y: 80,
    size: 10,
    font,
    color: BLACK
  });
}

async function drawScreenshotPage(pdf, capture) {
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: CREAM });

  const pngBytes = await fs.readFile(capture.filePath);
  const image = await pdf.embedPng(pngBytes);

  const maxWidth = PAGE_WIDTH - 80;
  const maxHeight = PAGE_HEIGHT - 150;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (PAGE_WIDTH - width) / 2;
  const y = 110;

  page.drawImage(image, { x, y, width, height });

  page.drawText(capture.name, {
    x: 40,
    y: PAGE_HEIGHT - 40,
    size: 14,
    font: fontBold,
    color: BLACK
  });

  const meta = [
    `Viewport: ${capture.viewport.label}`,
    `Build: ${capture.buildStatus}`,
    `Tests: ${capture.testStatus}`
  ];

  let metaY = 72;
  for (const line of meta) {
    page.drawText(line, { x: 40, y: metaY, size: 10, font, color: BLACK });
    metaY -= 16;
  }
}

async function drawSummaryPage(pdf, meta) {
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: CREAM });
  page.drawRectangle({ x: 40, y: PAGE_HEIGHT - 48, width: 56, height: 3, color: BLUE });

  page.drawText('Summary', {
    x: 40,
    y: PAGE_HEIGHT - 80,
    size: 20,
    font: fontBold,
    color: BLACK
  });

  const sections = [
    { title: 'Playwright', lines: [meta.playwrightSummary] },
    { title: 'Build', lines: [meta.buildStatus] },
    { title: 'Typecheck', lines: [meta.typecheckStatus] },
    { title: 'Deployment', lines: [DEPLOYMENT_URL] },
    {
      title: 'Known Issues',
      lines: meta.knownIssues.length ? meta.knownIssues : ['None documented.']
    },
    {
      title: 'Future Improvements',
      lines: meta.futureImprovements.length ? meta.futureImprovements : ['See docs/02_NEXT_STEPS.md']
    }
  ];

  let y = PAGE_HEIGHT - 115;
  for (const section of sections) {
    page.drawText(section.title, { x: 40, y, size: 11, font: fontBold, color: BLACK });
    y -= 16;

    for (const line of section.lines) {
      const wrapped = wrapText(`• ${line}`, 95);
      for (const part of wrapped) {
        if (y < 50) break;
        page.drawText(part, { x: 48, y, size: 9, font, color: BLACK });
        y -= 13;
      }
      y -= 4;
    }
    y -= 6;
  }
}

async function buildPdf(meta, captures) {
  const pdf = await PDFDocument.create();
  await drawCoverPage(pdf, meta);

  for (const capture of captures) {
    await drawScreenshotPage(pdf, capture);
  }

  await drawSummaryPage(pdf, meta);

  const bytes = await pdf.save();
  const outputPath = path.join(REVIEWS_DIR, `DESIGN_REVIEW_${meta.version}.pdf`);
  await fs.mkdir(REVIEWS_DIR, { recursive: true });
  await fs.writeFile(outputPath, bytes);
  return outputPath;
}

async function main() {
  console.log('Giuseppe OS — Design Review Generator\n');

  const version = readPackageVersion();
  const commit = gitValue('git rev-parse --short HEAD');
  const branch = gitValue('git rev-parse --abbrev-ref HEAD');
  const date = new Date().toISOString().slice(0, 10);

  console.log('Running typecheck...');
  const typecheck = run('npm run typecheck');
  const typecheckStatus = typecheck.ok ? 'PASS' : 'FAIL';

  console.log('Running Playwright tests...');
  const tests = run('npm run test:e2e');
  const testStatus = tests.ok ? 'PASS' : 'FAIL';
  const playwrightSummary = tests.ok
    ? (tests.output.match(/\d+ passed/)?.[0] ?? 'All tests passed')
    : 'Tests failed — see CI logs';

  console.log('Running production build...');
  const build = run('npm run build');
  const buildStatus = build.ok ? 'PASS' : 'FAIL';

  if (!build.ok) {
    console.error('Build failed. Cannot capture screenshots.');
    process.exit(1);
  }

  const knownIssues = await readSection(
    path.join(ROOT, 'docs', '01_CURRENT_STATUS.md'),
    'Known Limitations'
  );
  const futureImprovements = [
    ...(await readSection(path.join(ROOT, 'docs', '02_NEXT_STEPS.md'), 'Priority 1 — Wire UI Through Executive Brain')),
    ...(await readSection(path.join(ROOT, 'docs', '02_NEXT_STEPS.md'), 'Priority 2 — Memory Persistence (Supabase)'))
  ].slice(0, 6);

  console.log('Starting production server for screenshots...');
  const server = startServer();

  try {
    await waitForServer(SERVER_URL);
    const captures = await captureScreenshots(buildStatus, testStatus);

    const outputPath = await buildPdf(
      {
        version,
        date,
        commit,
        branch,
        buildStatus,
        typecheckStatus,
        testStatus,
        playwrightSummary,
        knownIssues,
        futureImprovements
      },
      captures
    );

    console.log(`\nDesign review generated: ${outputPath}`);
  } finally {
    server.kill('SIGTERM');
    await fs.rm(TMP_DIR, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
