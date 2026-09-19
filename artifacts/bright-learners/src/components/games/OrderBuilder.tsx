import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSubmitScore, type ScoreInputGame } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { Brighty } from '@/components/Brighty';
import { ArrowLeft, Delete, Trophy } from 'lucide-react';
import type { OrderBuilderItem } from '@/data/gamesContent';

export type OrderBuilderTheme = {
  gameKey: ScoreInputGame;
  title: string;
  description: string;
  icon: string;
  gradientClass: string;
};

function shuffleTokens(tokens: string[]): number[] {
  const indices = tokens.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  // Avoid the unlucky case where the shuffle lands on the original order.
  if (indices.every((v, i) => v === i) && indices.length > 1) {
    [indices[0], indices[1]] = [indices[1], indices[0]];
  }
  return indices;
}

export function OrderBuilder({ theme, items }: { theme: OrderBuilderTheme; items: OrderBuilderItem[] }) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const submitScore = useSubmitScore();

  const [screen, setScreen] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [itemIndex, setItemIndex] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const item = items[itemIndex];
  const shuffledOrder = useMemo(() => shuffleTokens(item.tokens), [item]);

  const placedTokens = placed.map((i) => item.tokens[i]);
  const targetJoiner = theme.gameKey === 'sentence-builder' ? ' ' : '';

  const startGame = () => {
    setItemIndex(0);
    setPlaced([]);
    setScore(0);
    setRoundComplete(false);
    setScreen('playing');
    playSound('click');
  };

  const handleTokenTap = (tokenIndex: number) => {
    if (roundComplete || placed.includes(tokenIndex)) return;

    const candidate = [...placed, tokenIndex].map((i) => item.tokens[i]);
    const isStillCorrect = candidate.every((tok, pos) => tok === item.tokens[pos]);

    if (!isStillCorrect) {
      playSound('wrong');
      return;
    }

    playSound('click');
    const next = [...placed, tokenIndex];
    setPlaced(next);

    if (next.length === item.tokens.length) {
      playSound('correct');
      setScore((s) => s + 1);
      setRoundComplete(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    }
  };

  const handleClear = () => {
    setPlaced([]);
    playSound('click');
  };

  const handleNext = () => {
    if (itemIndex + 1 >= items.length) {
      finish();
      return;
    }
    setItemIndex(itemIndex + 1);
    setPlaced([]);
    setRoundComplete(false);
  };

  const finish = () => {
    setScreen('finished');
    playSound('celebration');
    if (user) {
      submitScore.mutate({
        data: {
          userId: user.id,
          game: theme.gameKey,
          score,
          coinsEarned: score * 5,
          starsEarned: Math.floor(score / 3),
        },
      });
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
            <div className="text-8xl mb-6">{theme.icon}</div>
            <h1 className="text-5xl font-black text-foreground mb-4">{theme.title}</h1>
            <p className="text-2xl text-muted-foreground font-bold mb-8">{theme.description}</p>

            <Button
              onClick={startGame}
              size="lg"
              className={`w-full bg-gradient-to-r ${theme.gradientClass} text-white font-black text-2xl rounded-2xl h-20`}
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
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50 max-w-2xl w-full"
        >
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-5xl font-black text-foreground mb-4">Nice Building!</h1>
          <p className="text-2xl text-muted-foreground font-bold mb-8">
            You completed {score} of {items.length}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={startGame}
              size="lg"
              className={`bg-gradient-to-r ${theme.gradientClass} text-white font-black rounded-2xl`}
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
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/games">
            <Button variant="ghost" className="rounded-full" data-testid="button-back-playing">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <div className="bg-white dark:bg-card rounded-3xl px-8 py-4 shadow-lg border-4 border-white/50">
            <div className="text-sm font-bold text-muted-foreground mb-1">Progress</div>
            <div className="text-2xl font-black text-foreground">{itemIndex + 1} / {items.length}</div>
          </div>
        </div>

        <motion.div
          key={itemIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-card rounded-3xl p-10 shadow-2xl border-4 border-white/50 text-center"
        >
          <p className="text-xl font-bold text-muted-foreground mb-8">{item.clue}</p>

          {/* Answer slots */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {item.tokens.map((token, i) => (
              <div
                key={i}
                className={`min-w-16 h-16 px-3 rounded-2xl border-4 flex items-center justify-center text-2xl font-black ${
                  placedTokens[i]
                    ? 'bg-green-100 dark:bg-green-900 border-green-400 text-green-700 dark:text-green-300'
                    : 'bg-muted border-dashed border-muted-foreground/30 text-transparent'
                }`}
              >
                {placedTokens[i] ?? token}
              </div>
            ))}
          </div>

          {!roundComplete ? (
            <>
              <div className="flex justify-center gap-3 mb-8 flex-wrap">
                {shuffledOrder.map((tokenIndex) => (
                  <motion.button
                    key={tokenIndex}
                    onClick={() => handleTokenTap(tokenIndex)}
                    disabled={placed.includes(tokenIndex)}
                    whileHover={!placed.includes(tokenIndex) ? { scale: 1.08 } : {}}
                    whileTap={!placed.includes(tokenIndex) ? { scale: 0.95 } : {}}
                    className={`min-w-16 h-16 px-4 rounded-2xl text-2xl font-black transition-all ${
                      placed.includes(tokenIndex)
                        ? 'bg-muted/40 text-transparent'
                        : `bg-gradient-to-br ${theme.gradientClass} text-white shadow-lg`
                    }`}
                    data-testid={`token-${tokenIndex}`}
                  >
                    {item.tokens[tokenIndex]}
                  </motion.button>
                ))}
              </div>
              <Button variant="outline" className="rounded-2xl font-bold" onClick={handleClear} data-testid="button-clear">
                <Delete className="w-5 h-5 mr-2" />
                Clear
              </Button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <Brighty celebrating size={80} />
                <div className="text-2xl font-black text-green-600">
                  {item.tokens.join(targetJoiner)}!
                </div>
              </div>
              <Button
                onClick={handleNext}
                size="lg"
                className={`w-full bg-gradient-to-r ${theme.gradientClass} text-white font-black text-xl rounded-2xl h-16`}
                data-testid="button-next"
              >
                {itemIndex + 1 < items.length ? 'Next One' : 'Finish'}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
