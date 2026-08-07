import { ChoiceBlitz } from '@/components/games/ChoiceBlitz';
import { shapeMatchQuestions } from '@/data/gamesContent';

export default function GameShapeMatch() {
  return (
    <ChoiceBlitz
      theme={{
        gameKey: 'shape-match',
        title: 'Shape Match',
        description: 'Match each clue to the right shape',
        icon: '🔷',
        gradientClass: 'from-cyan-500 to-blue-500',
        resultNoun: 'Shapes matched correctly',
      }}
      questions={shapeMatchQuestions}
    />
  );
}
