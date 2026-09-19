import { OrderBuilder } from '@/components/games/OrderBuilder';
import { wordBuilderItems } from '@/data/gamesContent';

export default function GameWordBuilder() {
  return (
    <OrderBuilder
      theme={{
        gameKey: 'word-builder',
        title: 'Word Builder',
        description: 'Tap the letters in the right order to build each word',
        icon: '🔤',
        gradientClass: 'from-emerald-500 to-teal-500',
      }}
      items={wordBuilderItems}
    />
  );
}
