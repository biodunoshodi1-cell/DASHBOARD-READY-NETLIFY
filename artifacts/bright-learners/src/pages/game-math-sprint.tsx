import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSubmitScore, useGetLeaderboard, useAwardRewards } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Zap, Lock, Star } from 'lucide-react';
import { mathLessons, type MathQuestion } from '@/data/lessonContent';

type Level = {
  id: number;
  name: string;
  description: string;
  timeSeconds: number;
  passScore: number;
  questions: MathQuestion[];
};

// Score submission and the leaderboard use the API's existing 'math-sprint'
// game key for every level (that enum is fixed by the backend schema) — all
// levels share one leaderboard, which also keeps this simple to extend.
const GAME_KEY = 'math-sprint' as const;

const levels: Level[] = [
  {
    id: 1,
    name: 'Level 1: Warm Up',
    description: 'Counting & Addition',
    timeSeconds: 60,
    passScore: 5,
    questions: [...mathLessons.counting.questions, ...mathLessons.addition.questions],
  },
  {
    id: 2,
    name: 'Level 2: Speeding Up',
    description: 'Subtraction & Multiplication',
    timeSeconds: 50,
    passScore: 6,
    questions: [...mathLessons.subtraction.questions, ...mathLessons.multiplication.questions],
  },
  {
    id: 3,
    name: 'Level 3: Sprint Champion',
    description: 'Division, Fractions & Word Problems',
    timeSeconds: 45,
    passScore: 6,
    questions: [
      ...mathLessons.division.questions,
      ...mathLessons.fractions.questions,
      ...mathLessons['word-problems'].questions,
    ],
  },
];

function unlockedLevelStorageKey(userId?: number) {
  return `bright-learners:math-sprint:unlocked-level:${userId ?? 'guest'}`;
}

function getUnlockedLevel(userId?: number): number {
  try {
    const raw = localStorage.getItem(unlockedLevelStorageKey(userId));
    const parsed = raw ? parseInt(raw, 10) : 1;
    return Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), levels.length);
  } catch {
    return 1;
  }
}

function setUnlockedLevel(userId: number | undefined, level: number) {
  try {
    localStorage.setItem(unlockedLevelStorageKey(userId), String(level));
  } catch {
    // localStorage unavailable (e.g. private browsing) — level just won't persist
  }
}

export default function GameMathSprint() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const submitScore = useSubmitScore();
  const awardRewards = useAwardRewards();

  const [screen, setScreen] = useState<'select' | 'ready' | 'playing' | 'finished'>('select');
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [unlockedLevel, setUnlockedLevelState] = useState(1);

  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const level = levels.find((l) => l.id === selectedLevelId)!;
  const currentQuestion = level.questions[currentQuestionIndex % level.questions.length];

  const { data: leaderboard } = useGetLeaderboard({ game: GAME_KEY, limit: 5 });

  useEffect(() => {
    setUnlockedLevelState(getUnlockedLevel(user?.id));
  }, [user?.id]);

  useEffect(() => {
    if (screen === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && screen === 'playing') {
      endGame();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, timeLeft]);

  const chooseLevel = (id: number) => {
    if (id > unlockedLevel) return;
    setSelectedLevelId(id);
    setScreen('ready');
    playSound('click');
  };

  const startGame = () => {
    setScreen('playing');
    setTimeLeft(level.timeSeconds);
    setScore(0);
    setCurrentQuestionIndex(0);
    playSound('click');
  };

  const handleAnswer = (answer: string) => {
    if (answer === currentQuestion.correct) {
      setScore((s) => s + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    setCurrentQuestionIndex((i) => i + 1);
  };

  const endGame = () => {
    setScreen('finished');
    playSound('celebration');

    if (score >= level.passScore && level.id === unlockedLevel && level.id < levels.length) {
      const next = level.id + 1;
      setUnlockedLevel(user?.id, next);
      setUnlockedLevelState(next);
    }

    if (user) {
      submitScore.mutate({
        data: {
          userId: user.id,
          game: GAME_KEY,
          score,
          coinsEarned: score * 5,
          starsEarned: Math.floor(score / 3),
        },
      });
    }
  };

  const justUnlockedNext = score >= level.passScore && level.id < levels.length;

  if (screen === 'select') {
    return (
      <div className="min-h-[100dvh] gradient-games p-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/games">
            <Button variant="ghost" className="mb-6 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Games
            </Button>
          </Link>

          <div className="text-center mb-8">
            <div className="text-7xl mb-4">🏃</div>
            <h1 className="text-5xl font-black text-white drop-shadow-lg mb-2">Math Sprint</h1>
            <p className="text-xl font-bold text-white/90 drop-shadow">Choose a level to begin!</p>
          </div>

          <div className="space-y-4">
            {levels.map((lvl) => {
              const locked = lvl.id > unlockedLevel;
              return (
                <motion.button
                  key={lvl.id}
                  onClick={() => chooseLevel(lvl.id)}
                  disabled={locked}
                  whileHover={!locked ? { scale: 1.02 } : {}}
                  whileTap={!locked ? { scale: 0.98 } : {}}
                  className={`w-full text-left p-6 rounded-3xl shadow-xl border-4 border-white/50 flex items-center gap-6 ${
                    locked
                      ? 'bg-white/40 dark:bg-card/40 cursor-not-allowed'
                      : 'bg-white dark:bg-card cursor-pointer'
                  }`}
                  data-testid={`level-${lvl.id}`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0 ${
                      locked ? 'bg-muted text-muted-foreground' : 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                    }`}
                  >
                    {locked ? <Lock className="w-7 h-7" /> : lvl.id}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-black ${locked ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {lvl.name}
                    </h3>
                    <p className="text-md font-semibold text-muted-foreground">{lvl.description}</p>
                    {locked && (
                      <p className="text-sm font-bold text-muted-foreground mt-1">
                        Score {levels[lvl.id - 2]?.passScore ?? 0}+ on Level {lvl.id - 1} to unlock
                      </p>
                    )}
                  </div>
                  {!locked && <Zap className="w-8 h-8 text-orange-500 shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'ready') {
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Button variant="ghost" className="mb-6 rounded-full" onClick={() => setScreen('select')} data-testid="button-back-select">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Choose a different level
          </Button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50"
          >
            <div className="text-8xl mb-6">🏃</div>
            <h1 className="text-4xl font-black text-foreground mb-2">{level.name}</h1>
            <p className="text-xl text-muted-foreground font-bold mb-8">{level.description}</p>
            <p className="text-lg text-muted-foreground font-semibold mb-8">
              Answer as many questions as you can in {level.timeSeconds} seconds!
              Score {level.passScore}+ to unlock the next level.
            </p>

            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 rounded-2xl p-6 mb-8">
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
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-2xl rounded-2xl h-20"
              data-testid="button-start-game"
            >
              <Zap className="w-8 h-8 mr-3" />
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
          <h1 className="text-5xl font-black text-foreground mb-2">Time's Up!</h1>
          <p className="text-lg font-bold text-muted-foreground mb-4">{level.name}</p>
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-6">
            {score}
          </div>
          <p className="text-2xl text-muted-foreground font-bold mb-4">Correct Answers!</p>

          {justUnlockedNext && (
            <div className="flex items-center justify-center gap-2 text-green-600 font-black text-lg mb-6">
              <Star className="w-6 h-6 fill-green-500" />
              Level {level.id + 1} unlocked!
            </div>
          )}
          {!justUnlockedNext && level.id < levels.length && (
            <p className="text-md font-bold text-muted-foreground mb-6">
              Score {level.passScore}+ to unlock Level {level.id + 1}. Give it another try!
            </p>
          )}

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
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black rounded-2xl"
              data-testid="button-play-again"
            >
              Play Again
            </Button>
            <Button
              onClick={() => setScreen('select')}
              variant="outline"
              size="lg"
              className="font-black rounded-2xl"
              data-testid="button-back-to-levels"
            >
              Level Select
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] gradient-games pb-12">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white font-black text-lg drop-shadow">{level.name}</div>
        </div>
        {/* Timer & Score */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            className="bg-white dark:bg-card rounded-3xl px-8 py-4 shadow-lg border-4 border-white/50"
            animate={{ scale: timeLeft <= 10 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
          >
            <div className="text-sm font-bold text-muted-foreground mb-1">Time Left</div>
            <div className={`text-5xl font-black ${timeLeft <= 10 ? 'text-red-600' : 'text-foreground'}`}>
              {timeLeft}s
            </div>
          </motion.div>

          <div className="bg-white dark:bg-card rounded-3xl px-8 py-4 shadow-lg border-4 border-white/50">
            <div className="text-sm font-bold text-muted-foreground mb-1">Score</div>
            <div className="text-5xl font-black text-green-600">{score}</div>
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 shadow-2xl border-4 border-white/50"
        >
          <h2 className="text-6xl font-black text-foreground text-center mb-12">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(option)}
                className="p-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-3xl text-4xl font-black text-foreground hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
                data-testid={`option-${index}`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Running Character Animation */}
        <motion.div
          className="mt-8 text-center"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <div className="text-6xl">🏃‍♂️</div>
        </motion.div>
      </div>
    </div>
  );
}
