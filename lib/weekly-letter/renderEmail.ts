import type { WeeklyLetterEvidence, WeeklyLetterResponse } from './types';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderList(items: string[]): string {
  if (items.length === 0) {
    return '<p class="muted">No evidence strong enough to name this yet.</p>';
  }

  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderEvidenceFooter(evidence: WeeklyLetterEvidence): string {
  const lines: string[] = [];
  if (evidence.decisions > 0) lines.push(`${evidence.decisions} decision${evidence.decisions === 1 ? '' : 's'}`);
  if (evidence.outcomes > 0) lines.push(`${evidence.outcomes} reviewed outcome${evidence.outcomes === 1 ? '' : 's'}`);
  if (evidence.dailyBriefs > 0) {
    lines.push(`${evidence.dailyBriefs} daily brief${evidence.dailyBriefs === 1 ? '' : 's'}`);
  } else if (evidence.workingSessions > 0) {
    lines.push(`${evidence.workingSessions} working session${evidence.workingSessions === 1 ? '' : 's'}`);
  }
  if (evidence.insights > 0) lines.push(`${evidence.insights} insight${evidence.insights === 1 ? '' : 's'}`);
  if (evidence.projectUpdates > 0) {
    lines.push(`${evidence.projectUpdates} project update${evidence.projectUpdates === 1 ? '' : 's'}`);
  } else if (evidence.knowledgeItems > 0) {
    lines.push(`${evidence.knowledgeItems} knowledge update${evidence.knowledgeItems === 1 ? '' : 's'}`);
  }
  if (evidence.guardianReports > 0) {
    lines.push(`${evidence.guardianReports} Guardian report${evidence.guardianReports === 1 ? '' : 's'}`);
  }
  if (evidence.connectedSources > 0) {
    lines.push(`${evidence.connectedSources} connected source${evidence.connectedSources === 1 ? '' : 's'}`);
  }

  if (lines.length === 0) {
    return '<p class="evidence muted">Based on constitution and self model only — weekly evidence is thin.</p>';
  }

  return `<p class="evidence">Based on:<br>${lines.map(line => `– ${escapeHtml(line)}`).join('<br>')}</p>`;
}

export function renderWeeklyLetterEmail(letter: WeeklyLetterResponse): string {
  const { content } = letter;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Weekly Letter — ${escapeHtml(letter.weekLabel)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f7f5e8;
      color: #111111;
      font-family: Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    .page {
      max-width: 640px;
      margin: 0 auto;
      padding: 48px 32px 64px;
    }
    h1 {
      font-size: 28px;
      font-weight: 500;
      letter-spacing: -0.02em;
      margin: 0 0 8px;
    }
    .meta {
      font-size: 14px;
      color: #444444;
      margin: 0 0 40px;
    }
    .opening {
      font-size: 20px;
      line-height: 1.45;
      margin: 0 0 40px;
      font-family: Georgia, "Times New Roman", serif;
    }
    h2 {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 32px 0 12px;
      color: #333333;
    }
    p { margin: 0 0 16px; }
    ul {
      margin: 0 0 16px;
      padding-left: 20px;
    }
    li { margin-bottom: 8px; }
    .advice {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 18px;
      line-height: 1.5;
      margin: 0;
    }
    .actions {
      margin-top: 8px;
    }
    .actions ol {
      margin: 0;
      padding-left: 20px;
    }
    .actions li {
      margin-bottom: 10px;
      font-weight: 500;
    }
    .evidence {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #d8d4c4;
      font-size: 13px;
      line-height: 1.6;
      color: #555555;
    }
    .closing {
      margin-top: 40px;
      font-size: 15px;
    }
    .muted { color: #666666; }
    @media print {
      body { background: #ffffff; }
      .page { padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <h1>Weekly Letter</h1>
    <p class="meta">Week ${letter.weekNumber}<br>${escapeHtml(letter.dateRange)}</p>

    <p class="opening">${escapeHtml(content.openingSentence)}</p>

    <h2>What I noticed</h2>
    ${renderList(content.noticed)}

    <h2>What moved you forward</h2>
    ${renderList(content.movedForward)}

    <h2>What slowed you down</h2>
    ${renderList(content.slowedDown)}

    <h2>Opportunities</h2>
    ${renderList(content.opportunities)}

    <h2>Manager's advice</h2>
    <p class="advice">${escapeHtml(content.managersAdvice)}</p>

    <h2>Three actions for next week</h2>
    <div class="actions">
      <ol>
        ${content.nextWeekActions.map(action => `<li>${escapeHtml(action)}</li>`).join('')}
      </ol>
    </div>

    ${renderEvidenceFooter(letter.evidence)}

    <p class="closing">See you next Monday.<br>— Giuseppe OS</p>
  </div>
</body>
</html>`;
}

export function weeklyLetterSubject(letter: WeeklyLetterResponse): string {
  return `Weekly Letter — Week ${letter.weekNumber}`;
}
