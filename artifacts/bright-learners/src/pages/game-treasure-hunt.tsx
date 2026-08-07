import { ChoiceBlitz } from '@/components/games/ChoiceBlitz';
import { treasureHuntQuestions } from '@/data/gamesContent';

export default function GameTreasureHunt() {
  return (
    <ChoiceBlitz
      theme={{
        gameKey: 'treasure-hunt',
        title: 'Treasure Hunt',
        description: 'Pick the chest with the correct answer to claim the treasure!',
        icon: '🏴‍☠️',
        gradientClass: 'from-amber-500 to-yellow-500',
        resultNoun: 'Chests opened correctly',
      }}
      questions={treasureHuntQuestions}
    />
  );
}
