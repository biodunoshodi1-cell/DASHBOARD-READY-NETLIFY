import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSubmitScore, useGetLeaderboard, type ScoreInputGame } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Heart } from 'lucide-react';
import type { QuizQuestion } from '@/data/lessonContent';

export type ChoiceBlitzTheme = {
  gameKey: ScoreInputGame;
  title: string;
  description: string;
  icon: string;
  gradientClass: string; // e.g. 'from-green-400 to-teal-500'
  resultNoun: string; // e.g. "correct answers", "chests opened"
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const STARTING_LIVES = 3;

export function ChoiceBlitz({ theme, questions }: { theme: ChoiceBlitzTheme; questions: QuizQuestion[] }) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const submitScore = useSubmitScore();
  const { data: leaderboard } = useGetLeaderboard({ game: theme.gameKey, limit: 5 });

  const [screen, setScreen] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [pool, setPool] = useState<QuizQuestion[]>(questions);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = pool[index % pool.length];

  const startGame = () => {
    setPool(shuffle(questions));
    setIndex(0);
    setLives(STARTING_LIVES);
    setScore(0);
    setSelected(null);
    setShowFeedback(false);
    setScreen('playing');
    playSound('click');
  };

  const finish = (finalScore: number) => {
    setScreen('finished');
    playSound('celebration');
    if (user) {
      submitScore.mutate({
        data: {
          userId: user.id,
          game: theme.gameKey,
          score: finalScore,
          coinsEarned: finalScore * 5,
          starsEarned: Math.floor(finalScore / 3),
        },
      });
    }
  };

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    setSelected(option);
    const correct = option === currentQuestion.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      playSound('correct');
      setScore((s) => s + 1);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    const remainingLives = isCorrect ? lives : lives - 1;
    const finalScore = isCorrect ? score : score;

    if (!isCorrect && remainingLives <= 0) {
      setLives(0);
      finish(finalScore);
      return;
    }

    if (index + 1 >= pool.length) {
      finish(finalScore);
      return;
    }

    setLives(remainingLives);
    setIndex(index + 1);
    setSelected(null);
    setShowFeedback(false);
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

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-black text-foreground mb-4">Top Scores</h3>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center text-foreground font-bold">
                      <span>{i + 1}. {entry.displayName}</span>
                      <span>{entry.score} points</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground font-semibold">Be the first to play!</p>
              )}
            </div>

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
          <h1 className="text-5xl font-black text-foreground mb-4">Well Played!</h1>
          <div className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${theme.gradientClass} mb-6`}>
            {score}
          </div>
          <p className="text-2xl text-muted-foreground font-bold mb-8">{theme.resultNoun}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-2xl p-6">
              <p className="text-sm font-bold text-muted-foreground mb-2">Coins Earned</p>
              <p className="text-4xl font-black text-foreground">{score * 5}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6">
              <p className="text-sm font-bold text-muted-foreground mb-2">Stars Earned</p>
              <p className="text-4xl font-black text-foreground">{Math.floor(score / 3)}</p>
            </div>
          </div>

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
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white dark:bg-card rounded-3xl px-8 py-4 shadow-lg border-4 border-white/50 flex items-center gap-2">
            {Array.from({ length: STARTING_LIVES }).map((_, i) => (
              <Heart
                key={i}
                className={`w-8 h-8 ${i < lives ? 'fill-red-500 text-red-500' : 'text-muted fill-muted'}`}
              />
            ))}
          </div>

          <div className="bg-white dark:bg-card rounded-3xl px-8 py-4 shadow-lg border-4 border-white/50">
            <div className="text-sm font-bold text-muted-foreground mb-1">Score</div>
            <div className="text-4xl font-black text-green-600">{score}</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-10 shadow-2xl border-4 border-white/50"
          >
            <h2 className="text-3xl font-black text-foreground text-center mb-10">{currentQuestion.question}</h2>

            <div className="grid grid-cols-2 gap-5 mb-6">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selected === option;
                const isCorrectAnswer = option === currentQuestion.correct;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrect;
                return (
                  <motion.button
                    key={i}
                    onClick={() => handleSelect(option)}
                    disabled={showFeedback}
                    whileHover={!showFeedback ? { scale: 1.04 } : {}}
                    whileTap={!showFeedback ? { scale: 0.96 } : {}}
                    className={`p-6 rounded-2xl text-2xl font-black transition-all ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-purple-500 text-white'
                        : `bg-gradient-to-br ${theme.gradientClass} bg-opacity-20 text-foreground hover:brightness-95`
                    }`}
                    data-testid={`option-${i}`}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {showFeedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <p className="text-center text-lg font-bold text-muted-foreground">
                  {isCorrect ? 'Correct!' : currentQuestion.hint}
                </p>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className={`w-full bg-gradient-to-r ${theme.gradientClass} text-white font-black text-xl rounded-2xl h-16`}
                  data-testid="button-next"
                >
                  Continue
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
