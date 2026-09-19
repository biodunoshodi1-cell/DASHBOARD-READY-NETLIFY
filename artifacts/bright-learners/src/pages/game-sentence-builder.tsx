import { OrderBuilder } from '@/components/games/OrderBuilder';
import { sentenceBuilderItems } from '@/data/gamesContent';

export default function GameSentenceBuilder() {
  return (
    <OrderBuilder
      theme={{
        gameKey: 'sentence-builder',
        title: 'Sentence Builder',
        description: 'Tap the words in the right order to build each sentence',
        icon: '📝',
        gradientClass: 'from-indigo-500 to-purple-500',
      }}
      items={sentenceBuilderItems}
    />
  );
}
