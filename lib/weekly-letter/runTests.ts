import { parseWeeklyLetterResponse, normalizeWeeklyLetterContent } from './parse';
import { buildFallbackWeeklyLetter } from './fallback';
import { renderWeeklyLetterEmail, weeklyLetterSubject } from './renderEmail';
import type { WeeklyLetterContext } from './types';

const context: WeeklyLetterContext = {
  generatedAt: new Date().toISOString(),
  weekKey: '2026-W27',
  weekNumber: 27,
  dateRange: '29 June 2026 – 5 July 2026',
  weekLabel: 'Week 27, 2026',
  locale: 'en',
  northStar: 'Creative freedom with financial stability',
  mission: 'Build a body of work that outlives trends',
  priorities: ['Finish the album', 'Protect deep work'],
  patterns: ['Overcommitting when energy is high'],
  activeProjects: [{ name: 'UREES', role: 'founder', status: 'active' }],
  evidenceBlock: '',
  evidence: {
    decisions: 2,
    outcomes: 1,
    dailyBriefs: 0,
    insights: 1,
    projectUpdates: 0,
    guardianReports: 0,
    connectedSources: 1,
    knowledgeItems: 2,
    workingSessions: 3,
    patterns: 1
  },
  thinEvidence: false,
  guardianNote: null,
  selfModelSummary: '',
  connectedSourceLabels: ['website']
};

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function testParse(): void {
  const parsed = parseWeeklyLetterResponse(
    JSON.stringify({
      openingSentence: 'A focused week.',
      noticed: ['One', 'Two'],
      movedForward: ['A'],
      slowedDown: ['B'],
      opportunities: ['C'],
      managersAdvice: 'Protect the work.',
      nextWeekActions: ['Do one thing', 'Do two', 'Do three']
    })
  );

  assert(parsed.openingSentence === 'A focused week.', 'opening sentence');
  assert(parsed.nextWeekActions.length === 3, 'three actions');
}

function testRender(): void {
  const fallback = buildFallbackWeeklyLetter(context);
  const content = normalizeWeeklyLetterContent(
    {
      openingSentence: '',
      noticed: [],
      movedForward: [],
      slowedDown: [],
      opportunities: [],
      managersAdvice: '',
      nextWeekActions: []
    },
    fallback
  );

  const html = renderWeeklyLetterEmail({
    weekKey: context.weekKey,
    weekNumber: context.weekNumber,
    dateRange: context.dateRange,
    weekLabel: context.weekLabel,
    content,
    evidence: context.evidence,
    source: 'fallback',
    generatedAt: context.generatedAt,
    cached: false,
    thinEvidence: false
  });

  assert(html.includes('Weekly Letter'), 'title');
  assert(html.includes('#f7f5e8'), 'brand background');
  assert(html.includes('Manager&#39;s advice') || html.includes("Manager's advice"), 'advice section');
  assert(weeklyLetterSubject({ weekNumber: 27 } as never).includes('Week 27'), 'subject');
}

function main(): void {
  testParse();
  testRender();
  console.log('weekly-letter tests passed');
}

main();
