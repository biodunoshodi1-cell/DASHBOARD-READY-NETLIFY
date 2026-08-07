import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSubmitScore, useAwardRewards } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';

const emojis = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function GameMemory() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const submitScore = useSubmitScore();
  const awardRewards = useAwardRewards();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      setMoves(moves + 1);

      if (cards[first].emoji === cards[second].emoji) {
        playSound('correct');
        setCards(cards.map((card, i) =>
          i === first || i === second ? { ...card, isMatched: true } : card
        ));
        setMatches(matches + 1);
        setFlippedCards([]);

        if (matches + 1 === emojis.length) {
          setTimeout(() => {
            setGameState('finished');
            playSound('celebration');
            if (user) {
              const score = Math.max(100 - moves * 2, 0);
              const coinsEarned = score;
              const starsEarned = Math.floor(score / 10);
              submitScore.mutate({
                data: {
                  userId: user.id,
                  game: 'memory-match',
                  score,
                  coinsEarned,
                  starsEarned,
                },
              });
              awardRewards.mutate({
                data: { userId: user.id, coins: coinsEarned, stars: starsEarned, xp: coinsEarned },
              });
            }
          }, 500);
        }
      } else {
        playSound('wrong');
        setTimeout(() => {
          setCards(cards.map((card, i) =>
            i === first || i === second ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards]);

  const handleCardClick = (index: number) => {
    if (flippedCards.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

    playSound('click');
    setCards(cards.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
    setFlippedCards([...flippedCards, index]);
  };

  const startGame = () => {
    initializeGame();
    setGameState('playing');
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Link href="/games">
            <Button variant="ghost" className="mb-6 rounded-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Games
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50"
          >
            <div className="text-8xl mb-6">🧠</div>
            <h1 className="text-5xl font-black text-foreground mb-4">Memory Match</h1>
            <p className="text-2xl text-muted-foreground font-bold mb-8">
              Find all matching pairs in as few moves as possible!
            </p>

            <Button
              onClick={startGame}
              size="lg"
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-black text-2xl rounded-2xl h-20"
            >
              Start Game
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const score = Math.max(100 - moves * 2, 0);

    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50 max-w-2xl w-full"
        >
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-5xl font-black text-foreground mb-4">Great Job!</h1>
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-6">
            {moves}
          </div>
          <p className="text-2xl text-muted-foreground font-bold mb-8">Moves Used!</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-2xl p-6">
              <p className="text-sm font-bold text-muted-foreground mb-2">Score</p>
              <p className="text-4xl font-black text-foreground">{score}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6">
              <p className="text-sm font-bold text-muted-foreground mb-2">Stars</p>
              <p className="text-4xl font-black text-foreground">{Math.floor(score / 10)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={startGame}
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-black rounded-2xl"
            >
              Play Again
            </Button>
            <Button
              onClick={() => setLocation('/games')}
              variant="outline"
              size="lg"
              className="font-black rounded-2xl"
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/games">
            <Button variant="ghost" className="rounded-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>

          <div className="bg-white dark:bg-card rounded-3xl px-8 py-4 shadow-lg border-4 border-white/50">
            <div className="text-sm font-bold text-muted-foreground mb-1">Moves</div>
            <div className="text-5xl font-black text-foreground">{moves}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className="aspect-square bg-white dark:bg-card rounded-2xl shadow-lg border-4 border-white/50 overflow-hidden relative"
              whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="w-full h-full absolute inset-0"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="w-full h-full absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-4xl">?</div>
                </div>

                {/* Back */}
                <div
                  className={`w-full h-full absolute inset-0 flex items-center justify-center ${
                    card.isMatched ? 'bg-green-200 dark:bg-green-800' : 'bg-white dark:bg-card'
                  }`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="text-6xl">{card.emoji}</div>
                </div>
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
