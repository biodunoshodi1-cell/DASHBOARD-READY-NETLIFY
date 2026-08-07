import { ChoiceBlitz } from '@/components/games/ChoiceBlitz';
import { pictureRevealQuestions } from '@/data/gamesContent';

export default function GamePicturePuzzle() {
  return (
    <ChoiceBlitz
      theme={{
        gameKey: 'picture-puzzle',
        title: 'Picture Puzzle',
        description: 'Answer correctly to reveal fun facts about the world around us!',
        icon: '🖼️',
        gradientClass: 'from-orange-500 to-red-500',
        resultNoun: 'Facts answered correctly',
      }}
      questions={pictureRevealQuestions}
    />
  );
}
