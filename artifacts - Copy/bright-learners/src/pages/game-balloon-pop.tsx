import { ChoiceBlitz } from '@/components/games/ChoiceBlitz';
import { balloonPopQuestions } from '@/data/gamesContent';

export default function GameBalloonPop() {
  return (
    <ChoiceBlitz
      theme={{
        gameKey: 'balloon-pop',
        title: 'Balloon Pop',
        description: 'Pop the balloon with the right answer before you run out of lives!',
        icon: '🎈',
        gradientClass: 'from-pink-500 to-rose-500',
        resultNoun: 'Balloons popped correctly',
      }}
      questions={balloonPopQuestions}
    />
  );
}
