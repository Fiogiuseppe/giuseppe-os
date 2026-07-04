import { MEDIUM_BIO_BLOCK } from './rules';
import type { ContentFormat } from './types';
import type { SourceMaterial } from './types';

function storyCards(material: SourceMaterial): string[] {
  const hook = material.summary.slice(0, 80);
  return [
    `I keep returning to one thread: ${hook}`,
    'Not a hack. A small choice that changed the week.',
    'The lesson was quieter than I expected.',
    'Still learning what it means in practice.'
  ];
}

export function buildMockContent(format: ContentFormat, material: SourceMaterial): string | string[] {
  const anchor = material.summary;

  if (format === 'medium') {
    return `I did not plan to write about this.

${anchor} sat with me longer than I expected — not as a slogan, but as a lived week. I had the decision in front of me, the usual noise around it, and the familiar pull to look decisive before I was honest.

What helped was slowing down enough to name what was true: ${material.body.split('\n')[0] ?? anchor}. Not the performance of certainty. The smaller fact underneath it.

I tried one move. Not heroic. Specific. I kept the long horizon in view and let the short-term discomfort be information instead of an alarm.

Nothing exploded. That was the point. The shift was quiet — a little more room, a little less drift. I am still inside the experiment. I do not know the full ending yet, and that is honest.

If you are in a similar season: you do not need a louder answer. You need a truer one, repeated gently.

${MEDIUM_BIO_BLOCK}`;
  }

  if (format === 'linkedin') {
    return `I wrote a short piece about a decision I have been sitting with: ${anchor}.

Not a framework drop — just what happened when I stopped performing certainty and paid attention to what the week was actually teaching me.

If that sounds familiar, I would be glad if you read it. Link in comments when it is live.`;
  }

  return storyCards(material);
}
