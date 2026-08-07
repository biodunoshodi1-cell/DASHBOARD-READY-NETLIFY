/** Fisher-Yates shuffle - returns a new shuffled array, doesn't mutate the input. */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles a question's answer options too (not just question order), so
 * the correct answer isn't always in the same position on replay - answers
 * are matched by value/id elsewhere, not by array index, so this is safe.
 */
export function shuffleQuestionsAndOptions<T extends { options: string[] }>(questions: T[]): T[] {
  return shuffleArray(questions).map((q) => ({ ...q, options: shuffleArray(q.options) }));
}
