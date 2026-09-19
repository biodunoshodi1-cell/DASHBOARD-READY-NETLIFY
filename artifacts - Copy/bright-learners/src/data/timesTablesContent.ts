import type { MathLesson, MathQuestion } from './lessonContent';

// ---------------------------------------------------------------------------
// Times Tables Rock Stars content — one lesson per table (1x-12x) plus a
// "mixed" lesson that pools every table together. Each lesson is a normal
// MathLesson, so it plugs straight into the existing lesson/quiz machinery
// (Live Race topics, the Rock Arena sprint, etc.) with no special-casing.
//
// Every fact is asked both ways round ("7 x 4" and "4 x 7") so a player
// genuinely learns the fact rather than one fixed phrasing of it.
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Builds four multiple-choice options for a x b, using near-miss mistakes a
// real learner would plausibly make as distractors (off by one multiple of
// a or b, or the "added instead of multiplied" slip) rather than random
// noise — this keeps the quiz genuinely testing table recall.
function buildMultiplicationOptions(a: number, b: number, correct: number): string[] {
  const candidates = new Set<number>([correct]);
  const maybeAdd = (n: number) => {
    if (n > 0 && n !== correct) candidates.add(n);
  };
  maybeAdd(correct + a);
  maybeAdd(correct - a);
  maybeAdd(correct + b);
  maybeAdd(correct - b);
  maybeAdd(a + b); // classic "added instead of multiplied" mistake
  maybeAdd((a + 1) * b);
  maybeAdd(a * (b + 1));

  let options = Array.from(candidates);
  // Trim down to 3 distractors (plus the correct answer) if we generated extra.
  options = shuffleArray(options.filter((n) => n !== correct)).slice(0, 3);
  options.push(correct);

  // Extraordinarily rare fallback if near-miss generation didn't yield 3
  // distinct positive distractors (tiny tables like 1x can run short).
  let guard = 0;
  while (options.length < 4 && guard < 50) {
    const jitter = randomInt(1, 6);
    const candidate = Math.random() < 0.5 ? correct + jitter : Math.max(1, correct - jitter);
    if (!options.includes(candidate)) options.push(candidate);
    guard++;
  }

  return shuffleArray(options.map(String));
}

function buildTableQuestions(table: number): MathQuestion[] {
  const questions: MathQuestion[] = [];
  for (let n = 1; n <= 12; n++) {
    const correct = table * n;
    questions.push({
      id: `tt-${table}x-fwd-${n}`,
      question: `What is ${table} \u00d7 ${n}?`,
      options: buildMultiplicationOptions(table, n, correct),
      correct: String(correct),
      hint: `Think of ${n} groups of ${table}`,
    });
    questions.push({
      id: `tt-${table}x-rev-${n}`,
      question: `What is ${n} \u00d7 ${table}?`,
      options: buildMultiplicationOptions(n, table, correct),
      correct: String(correct),
      hint: `Same as ${table} groups of ${n}`,
    });
  }
  return questions;
}

export const timesTablesLessons: Record<string, MathLesson> = {};
for (let table = 1; table <= 12; table++) {
  timesTablesLessons[`table-${table}`] = {
    title: `${table}\u00d7 Table`,
    year: table <= 5 ? 3 : 4,
    strand: 'Number - multiplication and division',
    questions: buildTableQuestions(table),
  };
}

// A single pooled lesson covering every table 2-12 (1x is trivial and left
// out of the mixed pool so it doesn't dilute practice of the harder facts) —
// used for "Mixed" mode in the Garage, Soundcheck and Rock Arena.
timesTablesLessons['mixed'] = {
  title: 'Mixed (2\u00d7-12\u00d7)',
  year: 4,
  strand: 'Number - multiplication and division',
  questions: Object.entries(timesTablesLessons)
    .filter(([key]) => key !== 'table-1')
    .flatMap(([, lesson]) => lesson.questions),
};

export const TIMES_TABLES_ORDER = [
  'mixed',
  ...Array.from({ length: 12 }, (_, i) => `table-${i + 1}`),
];

export function timesTablesLabel(key: string): string {
  return timesTablesLessons[key]?.title ?? key;
}
