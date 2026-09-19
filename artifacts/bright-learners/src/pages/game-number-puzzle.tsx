import { ChoiceBlitz } from '@/components/games/ChoiceBlitz';
import { numberPuzzleQuestions } from '@/data/gamesContent';

export default function GameNumberPuzzle() {
  return (
    <ChoiceBlitz
      theme={{
        gameKey: 'number-puzzle',
        title: 'Number Puzzle',
        description: 'Solve the number mystery clues!',
        icon: '🧩',
        gradientClass: 'from-violet-500 to-fuchsia-500',
        resultNoun: 'Puzzles solved correctly',
      }}
      questions={numberPuzzleQuestions}
    />
  );
}
