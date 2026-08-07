import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSubmitScore } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { ArrowLeft, Trophy } from 'lucide-react';
import { letterMatchPairs } from '@/data/gamesContent';

type Card = {
  key: string;
  letter: string;
  isUpper: boolean;
  matched: boolean;
};

function buildDeck(): Card[] {
  const cards: Card[] = [];
  letterMatchPairs.forEach((letter) => {
    cards.push({ key: `${letter}-upper`, letter, isUpper: true, matched: false });
    cards.push({ key: `${letter}-lower`, letter, isUpper: false, matched: false });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function GameLetterMatch() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const submitScore = useSubmitScore();

  const [screen, setScreen] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [confetti, setConfetti] = useState(false);

  const matchedCount = cards.filter((c) => c.matched).length;

  useEffect(() => {
    if (screen === 'playing' && cards.length > 0 && matchedCount === cards.length) {
      const timeout = setTimeout(() => {
        setScreen('finished');
        playSound('celebration');
        const score = Math.max(0, letterMatchPairs.length * 10 - moves * 2);
        if (user) {
          submitScore.mutate({
            data: {
              userId: user.id,
              game: 'letter-match',
              score,
              coinsEarned: score,
              starsEarned: Math.floor(score / 10),
            },
          });
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCount, cards.length, screen]);

  const startGame = () => {
    setCards(buildDeck());
    setFlipped([]);
    setMoves(0);
    setScreen('playing');
    playSound('click');
  };

  const handleFlip = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || cards[index].matched) return;

    const next = [...flipped, index];
    setFlipped(next);
    playSound('click');

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      const cardA = cards[a];
      const cardB = cards[b];
      const isMatch = cardA.letter === cardB.letter && cardA.isUpper !== cardB.isUpper;

      setTimeout(() => {
        if (isMatch) {
          playSound('correct');
          setCards((prev) => prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
        } else {
          playSound('wrong');
        }
        setFlipped([]);
      }, 700);
    }
  };

  if (screen === 'ready') {
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Link href="/games">
            <Button variant="ghost" className="mb-6 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Games
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50"
          >
            <div className="text-8xl mb-6">🔤</div>
            <h1 className="text-5xl font-black text-foreground mb-4">Letter Match</h1>
            <p className="text-2xl text-muted-foreground font-bold mb-8">
              Flip cards to match each uppercase letter to its lowercase pair
            </p>
            <Button
              onClick={startGame}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-2xl rounded-2xl h-20"
              data-testid="button-start-game"
            >
              Start Game
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (screen === 'finished') {
    const score = Math.max(0, letterMatchPairs.length * 10 - moves * 2);
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50 max-w-2xl w-full"
        >
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-5xl font-black text-foreground mb-4">All Matched!</h1>
          <p className="text-2xl text-muted-foreground font-bold mb-2">You did it in {moves} moves</p>
          <p className="text-4xl font-black text-blue-600 mb-8">{score} points</p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={startGame}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black rounded-2xl"
              data-testid="button-play-again"
            >
              Play Again
            </Button>
            <Button
              onClick={() => setLocation('/games')}
              variant="outline"
              size="lg"
              className="font-black rounded-2xl"
              data-testid="button-back-to-games"
            >
              Back to Games
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] gradient-games pb-12">
      <ConfettiEffect trigger={confetti} />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/games">
            <Button variant="ghost" className="rounded-full" data-testid="button-back-playing">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <div className="bg-white dark:bg-card rounded-3xl px-6 py-3 shadow-lg border-4 border-white/50">
            <span className="text-lg font-black text-foreground">Moves: {moves}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || card.matched;
            return (
              <motion.button
                key={card.key}
                onClick={() => handleFlip(index)}
                whileTap={!isFlipped ? { scale: 0.95 } : {}}
                className={`aspect-square rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg transition-colors ${
                  card.matched
                    ? 'bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : isFlipped
                    ? 'bg-white dark:bg-card text-foreground border-4 border-blue-400'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                }`}
                data-testid={`card-${index}`}
              >
                {isFlipped ? (card.isUpper ? card.letter : card.letter.toLowerCase()) : '?'}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
