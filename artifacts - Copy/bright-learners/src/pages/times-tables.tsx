import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import {
  useSubmitScore,
  useGetLeaderboard,
  useGetUserScores,
  useUpdateUser,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Zap, Star, Guitar, Mic2 } from 'lucide-react';
import { timesTablesLessons, TIMES_TABLES_ORDER, timesTablesLabel } from '@/data/timesTablesContent';
import type { MathQuestion } from '@/data/lessonContent';
import { StarBurst } from '@/components/StarBurst';

// ---------------------------------------------------------------------------
// Times Tables Rock Stars — a self-contained hub with three modes, mirroring
// the real TT Rock Stars app:
//   - Garage:      untimed, pressure-free practice. Doesn't submit a score.
//   - Soundcheck:  a 60-second timed sprint. Submits to the shared
//                  'times-tables' leaderboard and counts toward Rock Status.
//   - Rock Arena:  live multiplayer racing — reuses the existing Live Race
//                  game (game-live-race.tsx), which already has a
//                  'timestables' subject wired up.
// Rock Status and rewards ride on the app's existing games/rewards system
// (game_scores + user_progress) rather than new backend tables.
// ---------------------------------------------------------------------------

const GAME_KEY = 'times-tables' as const;
const SOUNDCHECK_SECONDS = 60;

const ROCK_AVATARS = [
  { id: 'guitarist', emoji: '\uD83E\uDD18\uD83C\uDFB8', name: 'Guitarist' },
  { id: 'singer', emoji: '\uD83C\uDFA4', name: 'Lead Singer' },
  { id: 'drummer', emoji: '\uD83E\uDD41', name: 'Drummer' },
  { id: 'star', emoji: '\uD83C\uDF1F', name: 'Rising Star' },
  { id: 'crown', emoji: '\uD83D\uDC51', name: 'Headliner' },
  { id: 'fire', emoji: '\uD83D\uDD25', name: 'On Fire' },
];

type RockRank = { name: string; emoji: string; min: number };
const ROCK_RANKS: RockRank[] = [
  { name: 'Unsigned Artist', emoji: '\uD83C\uDFA4', min: 0 },
  { name: 'Breakthrough Artist', emoji: '\uD83C\uDFB5', min: 50 },
  { name: 'Support Act', emoji: '\uD83C\uDFA7', min: 150 },
  { name: 'Headliner', emoji: '\uD83C\uDFB8', min: 300 },
  { name: 'Rock Legend', emoji: '\uD83D\uDC51', min: 600 },
  { name: 'Rock God', emoji: '\uD83C\uDF1F', min: 1000 },
];

function getRank(totalCorrect: number): { current: RockRank; next: RockRank | null } {
  let current = ROCK_RANKS[0];
  for (const rank of ROCK_RANKS) {
    if (totalCorrect >= rank.min) current = rank;
  }
  const idx = ROCK_RANKS.indexOf(current);
  return { current, next: ROCK_RANKS[idx + 1] ?? null };
}

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type Screen =
  | 'hub'
  | 'garage-select'
  | 'garage-play'
  | 'soundcheck-select'
  | 'soundcheck-ready'
  | 'soundcheck-play'
  | 'soundcheck-finished';

export default function TimesTablesRockStars() {
  const { user } = useAuth();
  const { playSound } = useSettings();
  const submitScore = useSubmitScore();
  const updateUser = useUpdateUser();

  const [screen, setScreen] = useState<Screen>('hub');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // --- Rock Status (derived from past Soundcheck/Arena scores) -----------
  const { data: userScores } = useGetUserScores(user?.id || 0, {
    query: { enabled: !!user?.id },
  });
  const totalCorrect = useMemo(
    () => (userScores ?? []).filter((s) => s.game === GAME_KEY).reduce((sum, s) => sum + s.score, 0),
    [userScores],
  );
  const { current: rank, next: nextRank } = getRank(totalCorrect);

  const { data: leaderboard } = useGetLeaderboard({ game: GAME_KEY, limit: 5 });

  // --- Shared: table selection ---------------------------------------------
  const [selectedTableKey, setSelectedTableKey] = useState<string>('mixed');

  // --- Garage (untimed practice) -------------------------------------------
  const garageQueueRef = useRef<MathQuestion[]>([]);
  const [garageQuestion, setGarageQuestion] = useState<MathQuestion | null>(null);
  const [garageCorrect, setGarageCorrect] = useState(0);
  const [garageStreak, setGarageStreak] = useState(0);
  const [garageFeedback, setGarageFeedback] = useState<'correct' | 'wrong' | null>(null);

  const drawGarageQuestion = () => {
    if (garageQueueRef.current.length === 0) {
      garageQueueRef.current = shuffleArray(timesTablesLessons[selectedTableKey].questions);
    }
    setGarageQuestion(garageQueueRef.current.shift()!);
  };

  const startGarage = (tableKey: string) => {
    setSelectedTableKey(tableKey);
    garageQueueRef.current = shuffleArray(timesTablesLessons[tableKey].questions);
    setGarageQuestion(garageQueueRef.current.shift()!);
    setGarageCorrect(0);
    setGarageStreak(0);
    setGarageFeedback(null);
    setScreen('garage-play');
    playSound('click');
  };

  const handleGarageAnswer = (answer: string) => {
    if (!garageQuestion) return;
    if (answer === garageQuestion.correct) {
      setGarageCorrect((c) => c + 1);
      setGarageStreak((s) => s + 1);
      setGarageFeedback('correct');
      playSound('correct');
    } else {
      setGarageStreak(0);
      setGarageFeedback('wrong');
      playSound('wrong');
    }
    setTimeout(() => {
      setGarageFeedback(null);
      drawGarageQuestion();
    }, 500);
  };

  // --- Soundcheck (60s timed sprint) ---------------------------------------
  const soundcheckQueueRef = useRef<MathQuestion[]>([]);
  const [soundcheckQuestion, setSoundcheckQuestion] = useState<MathQuestion | null>(null);
  const [soundcheckScore, setSoundcheckScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showStarBurst, setShowStarBurst] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const drawSoundcheckQuestion = () => {
    if (soundcheckQueueRef.current.length === 0) {
      soundcheckQueueRef.current = shuffleArray(timesTablesLessons[selectedTableKey].questions);
    }
    setSoundcheckQuestion(soundcheckQueueRef.current.shift()!);
  };

  const chooseSoundcheck = (tableKey: string) => {
    setSelectedTableKey(tableKey);
    setScreen('soundcheck-ready');
    playSound('click');
  };

  const startSoundcheck = () => {
    soundcheckQueueRef.current = shuffleArray(timesTablesLessons[selectedTableKey].questions);
    setSoundcheckQuestion(soundcheckQueueRef.current.shift()!);
    setSoundcheckScore(0);
    setShowStarBurst(false);
    setTimeLeft(SOUNDCHECK_SECONDS);
    setScreen('soundcheck-play');
    playSound('click');
  };

  useEffect(() => {
    if (screen === 'soundcheck-play' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (screen === 'soundcheck-play' && timeLeft === 0) {
      endSoundcheck();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, timeLeft]);

  const handleSoundcheckAnswer = (answer: string) => {
    if (!soundcheckQuestion) return;
    if (answer === soundcheckQuestion.correct) {
      setSoundcheckScore((s) => s + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    drawSoundcheckQuestion();
  };

  const endSoundcheck = () => {
    setScreen('soundcheck-finished');
    playSound('celebration');
    if (soundcheckScore >= 20) setShowStarBurst(true);
    if (user) {
      submitScore.mutate({
        data: {
          userId: user.id,
          game: GAME_KEY,
          score: soundcheckScore,
          coinsEarned: soundcheckScore * 5,
          starsEarned: Math.floor(soundcheckScore / 3),
        },
      });
    }
  };

  const handlePickAvatar = (emoji: string) => {
    if (!user) return;
    updateUser.mutate(
      { userId: user.id, data: { avatarUrl: emoji } },
      { onSuccess: () => setShowAvatarPicker(false) },
    );
    playSound('click');
  };

  // ===========================================================================
  // Hub screen
  // ===========================================================================
  if (screen === 'hub') {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-purple-900 via-fuchsia-900 to-indigo-900 pb-12">
        <div className="bg-black/30 backdrop-blur-sm border-b-2 border-white/10">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <Link href="/games">
              <Button variant="ghost" className="mb-4 rounded-full text-white hover:text-white hover:bg-white/10" data-testid="button-back">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Games
              </Button>
            </Link>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl p-4 shadow-lg shrink-0">
                <Guitar className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg">Times Tables Rock Stars</h1>
                <p className="text-md sm:text-xl font-bold text-white/80">Practice, sprint, and battle friends live!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Rock Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur rounded-3xl p-6 border-2 border-white/20 flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-4xl shrink-0 hover:scale-105 transition-transform"
                data-testid="button-open-avatar-picker"
              >
                {user?.avatarUrl && user.avatarUrl.length <= 8 ? user.avatarUrl : '\uD83C\uDFB8'}
              </button>
              <div>
                <div className="text-sm font-bold text-white/60 uppercase tracking-wide">Rock Status</div>
                <div className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{rank.emoji}</span> {rank.name}
                </div>
                <div className="text-sm font-semibold text-white/70">{totalCorrect} correct answers so far</div>
              </div>
            </div>
            {nextRank && (
              <div className="text-right">
                <div className="text-xs font-bold text-white/60 uppercase tracking-wide mb-1">Next: {nextRank.name}</div>
                <div className="w-40 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-400"
                    style={{ width: `${Math.min(100, (totalCorrect / nextRank.min) * 100)}%` }}
                  />
                </div>
                <div className="text-xs font-semibold text-white/60 mt-1">{Math.max(0, nextRank.min - totalCorrect)} to go</div>
              </div>
            )}
          </motion.div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setScreen('garage-select')}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-left shadow-xl border-4 border-white/20"
              data-testid="button-mode-garage"
            >
              <div className="text-5xl mb-4">{'\uD83C\uDFE1'}</div>
              <h3 className="text-2xl font-black text-white mb-2">Garage</h3>
              <p className="text-sm font-semibold text-white/90">Untimed practice. No pressure — just get the facts solid.</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setScreen('soundcheck-select')}
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-left shadow-xl border-4 border-white/20"
              data-testid="button-mode-soundcheck"
            >
              <div className="text-5xl mb-4">{'\u23F1\uFE0F'}</div>
              <h3 className="text-2xl font-black text-white mb-2">Soundcheck</h3>
              <p className="text-sm font-semibold text-white/90">60-second timed sprint. Counts toward your Rock Status.</p>
            </motion.button>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href="/games/live-race">
                <div
                  className="bg-gradient-to-br from-fuchsia-500 to-purple-700 rounded-3xl p-8 text-left shadow-xl border-4 border-white/20 cursor-pointer h-full"
                  data-testid="button-mode-arena"
                >
                  <div className="text-5xl mb-4">{'\uD83C\uDFC6'}</div>
                  <h3 className="text-2xl font-black text-white mb-2">Rock Arena</h3>
                  <p className="text-sm font-semibold text-white/90">Race friends live with a room code — pick "Times Tables Rock Stars" as the subject.</p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur rounded-3xl p-6 border-2 border-white/20"
          >
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Soundcheck Top Scores
            </h3>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center text-white font-bold">
                    <span>{i + 1}. {entry.displayName}</span>
                    <span>{entry.score} correct</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/70 font-semibold">Be the first on the charts!</p>
            )}
          </motion.div>
        </div>

        {/* Avatar picker modal */}
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
              onClick={() => setShowAvatarPicker(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-card rounded-3xl p-8 max-w-lg w-full"
              >
                <h3 className="text-2xl font-black text-foreground mb-6 text-center">Pick Your Rock Avatar</h3>
                <div className="grid grid-cols-3 gap-4">
                  {ROCK_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handlePickAvatar(avatar.emoji)}
                      className="rounded-2xl p-4 bg-muted hover:bg-muted/70 text-center transition-colors"
                      data-testid={`avatar-${avatar.id}`}
                    >
                      <div className="text-4xl mb-2">{avatar.emoji}</div>
                      <div className="text-xs font-bold text-foreground">{avatar.name}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ===========================================================================
  // Table select (shared UI for Garage + Soundcheck)
  // ===========================================================================
  if (screen === 'garage-select' || screen === 'soundcheck-select') {
    const isGarage = screen === 'garage-select';
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-purple-900 via-fuchsia-900 to-indigo-900 p-6">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 rounded-full text-white hover:text-white hover:bg-white/10"
            onClick={() => setScreen('hub')}
            data-testid="button-back-hub"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-black text-white drop-shadow mb-2">{isGarage ? 'Garage' : 'Soundcheck'}</h1>
          <p className="text-lg text-white/80 font-semibold mb-8">Choose a table to practice</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TIMES_TABLES_ORDER.map((key) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (isGarage ? startGarage(key) : chooseSoundcheck(key))}
                className="bg-white dark:bg-card rounded-2xl p-5 shadow-lg border-4 border-white/40 text-center"
                data-testid={`table-${key}`}
              >
                <div className="text-3xl font-black text-foreground">{timesTablesLabel(key)}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // Garage play screen
  // ===========================================================================
  if (screen === 'garage-play') {
    if (!garageQuestion) return null;
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 pb-12">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <Button
              variant="ghost"
              className="rounded-full text-white hover:text-white hover:bg-white/10"
              onClick={() => setScreen('hub')}
              data-testid="button-end-garage"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Done for now
            </Button>
            <div className="flex gap-4">
              <div className="bg-white dark:bg-card rounded-2xl px-5 py-2 shadow-lg text-center">
                <div className="text-xs font-bold text-muted-foreground">Correct</div>
                <div className="text-2xl font-black text-green-600">{garageCorrect}</div>
              </div>
              <div className="bg-white dark:bg-card rounded-2xl px-5 py-2 shadow-lg text-center">
                <div className="text-xs font-bold text-muted-foreground">Streak</div>
                <div className="text-2xl font-black text-orange-500">{garageStreak}</div>
              </div>
            </div>
          </div>

          <motion.div
            key={garageQuestion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              backgroundColor: garageFeedback === 'correct' ? '#bbf7d0' : garageFeedback === 'wrong' ? '#fecaca' : undefined,
            }}
            className="bg-white dark:bg-card rounded-3xl p-10 shadow-2xl border-4 border-white/50"
          >
            <h2 className="text-4xl md:text-6xl font-black text-foreground text-center mb-8">{garageQuestion.question}</h2>
            <div className="grid grid-cols-2 gap-6">
              {garageQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleGarageAnswer(option)}
                  disabled={!!garageFeedback}
                  className="p-8 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-3xl text-4xl font-black text-foreground hover:scale-105 transition-transform disabled:opacity-70"
                  whileTap={{ scale: 0.95 }}
                  data-testid={`option-${index}`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // Soundcheck: ready screen
  // ===========================================================================
  if (screen === 'soundcheck-ready') {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-orange-700 via-red-700 to-orange-900 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Button
            variant="ghost"
            className="mb-6 rounded-full text-white hover:text-white hover:bg-white/10"
            onClick={() => setScreen('soundcheck-select')}
            data-testid="button-back-select"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Choose a different table
          </Button>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50"
          >
            <Mic2 className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-4xl font-black text-foreground mb-2">{timesTablesLabel(selectedTableKey)}</h1>
            <p className="text-lg text-muted-foreground font-semibold mb-8">
              Answer as many as you can in {SOUNDCHECK_SECONDS} seconds!
            </p>
            <Button
              onClick={startSoundcheck}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black text-2xl rounded-2xl h-20"
              data-testid="button-start-soundcheck"
            >
              <Zap className="w-8 h-8 mr-3" />
              Start Soundcheck
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // Soundcheck: playing
  // ===========================================================================
  if (screen === 'soundcheck-play') {
    if (!soundcheckQuestion) return null;
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-orange-700 via-red-700 to-orange-900 pb-12">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <motion.div
              className="bg-white dark:bg-card rounded-3xl px-8 py-4 shadow-lg border-4 border-white/50"
              animate={{ scale: timeLeft <= 10 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
            >
              <div className="text-sm font-bold text-muted-foreground mb-1">Time Left</div>
              <div className={`text-5xl font-black ${timeLeft <= 10 ? 'text-red-600' : 'text-foreground'}`}>{timeLeft}s</div>
            </motion.div>
            <div className="bg-white dark:bg-card rounded-3xl px-8 py-4 shadow-lg border-4 border-white/50">
              <div className="text-sm font-bold text-muted-foreground mb-1">Score</div>
              <div className="text-5xl font-black text-green-600">{soundcheckScore}</div>
            </div>
          </div>

          <motion.div
            key={soundcheckQuestion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-12 shadow-2xl border-4 border-white/50"
          >
            <h2 className="text-4xl md:text-6xl font-black text-foreground text-center mb-8">{soundcheckQuestion.question}</h2>
            <div className="grid grid-cols-2 gap-6">
              {soundcheckQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSoundcheckAnswer(option)}
                  className="p-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-3xl text-4xl font-black text-foreground hover:scale-105 transition-transform"
                  whileTap={{ scale: 0.95 }}
                  data-testid={`option-${index}`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // Soundcheck: finished
  // ===========================================================================
  if (screen === 'soundcheck-finished') {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-orange-700 via-red-700 to-orange-900 flex items-center justify-center p-6">
        <StarBurst trigger={showStarBurst} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50 max-w-2xl w-full"
        >
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-5xl font-black text-foreground mb-2">Soundcheck Complete!</h1>
          <p className="text-lg font-bold text-muted-foreground mb-4">{timesTablesLabel(selectedTableKey)}</p>
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-6">
            {soundcheckScore}
          </div>
          <p className="text-2xl text-muted-foreground font-bold mb-4">Correct Answers!</p>

          {showStarBurst && (
            <div className="flex items-center justify-center gap-2 text-orange-500 font-black text-lg mb-6">
              <Star className="w-6 h-6 fill-orange-500" />
              Rock star performance!
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-2xl p-6">
              <p className="text-sm font-bold text-muted-foreground mb-2">Coins Earned</p>
              <p className="text-4xl font-black text-foreground">{soundcheckScore * 5}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6">
              <p className="text-sm font-bold text-muted-foreground mb-2">Stars Earned</p>
              <p className="text-4xl font-black text-foreground">{Math.floor(soundcheckScore / 3)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={startSoundcheck}
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black rounded-2xl"
              data-testid="button-play-again"
            >
              Play Again
            </Button>
            <Button
              onClick={() => setScreen('hub')}
              variant="outline"
              size="lg"
              className="font-black rounded-2xl"
              data-testid="button-back-to-hub"
            >
              Rock Stars Hub
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
