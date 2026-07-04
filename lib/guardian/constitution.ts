import type { ProductSectionId } from '../architecture/sections';

export const GUARDIAN_NAME = 'The Guardian';

export const GUARDIAN_MISSION =
  'Make sure Giuseppe OS never slowly becomes a worse product. Protect simplicity, clarity, trust, performance, design consistency, product philosophy, code quality, and long-term vision.';

export const GUARDIAN_FINAL_QUESTION =
  'Will this make Giuseppe OS a more trustworthy decision partner?';

export const GUARDIAN_IMMUTABLE_PRINCIPLES = [
  'Truth over comfort.',
  'Clarity over noise.',
  'Trajectory over productivity.',
  'Identity before goals.',
  'Never fake confidence.',
  'Never fake data.',
  'Never increase complexity without increasing value.',
  'Always explain uncertainty.',
  'Always protect trust.',
  'Always protect simplicity.',
  'Always prefer removing over adding.',
  'Every new feature must justify its existence.'
] as const;

export const GUARDIAN_PROTECTS = [
  'simplicity',
  'clarity',
  'trust',
  'performance',
  'design consistency',
  'product philosophy',
  'code quality',
  'long-term vision'
] as const;

export const GUARDIAN_SECTION_QUESTIONS: Record<ProductSectionId, string> = {
  today: 'What is the highest leverage thing I can do today?',
  decisions: 'What is the best decision I can make?',
  insights: 'What am I not seeing?',
  create: 'What deserves my energy?',
  memory: 'Who do I want to continue being?'
};

export const GUARDIAN_REVIEW_DIMENSIONS = [
  'Architecture',
  'Performance',
  'Code quality',
  'UI consistency',
  'UX consistency',
  'Accessibility',
  'Responsive behaviour',
  'Animations',
  'Typography',
  'Spacing',
  'Broken components',
  'Unused components',
  'Dead code',
  'Duplicated code',
  'AI consistency',
  'Navigation',
  'Visual hierarchy',
  'Cognitive load',
  'Product philosophy'
] as const;

export const GUARDIAN_REJECTION_TRIGGERS = [
  'adds complexity',
  'reduces trust',
  'duplicates functionality',
  'breaks the philosophy',
  'creates unnecessary cognitive load',
  'introduces fake certainty'
] as const;

export const GUARDIAN_LOW_CONFIDENCE_PHRASE = "I don't know yet.";
