import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trophy, Zap, Users, Copy, Check, Crown, Calculator, FlaskConical, Map as MapIcon, Heart } from 'lucide-react';
import { mathLessons, type MathLesson } from '@/data/lessonContent';
import { scienceLessons } from '@/data/scienceContent';
import { geographyLessons } from '@/data/geographyContent';
import { psheLessons } from '@/data/psheContent';

// ---------------------------------------------------------------------------
// Live Challenge (Live Race) — a room-code multiplayer game. The host picks
// a subject and a specific topic (e.g. Math \u203a "Addition"), gets a short
// room code to share, and others join with that code. Everyone answers
// their own stream of questions drawn from that exact topic; a live
// leaderboard updates as scores come in. This page is entirely self
// contained and talks only to its own /api/live-race/* endpoints \u2014 it
// doesn't touch or reuse state from any other game.
//
// A room supports up to MAX_ROUNDS "play again" rounds on the same code
// (same or different players each round) replaying the same topic \u2014 each
// round is at least 120 seconds, and gets its own fresh, fully-shuffled
// pass through that topic's question bank so nothing repeats within a
// round; after the final round the room closes and the code stops working.
// ---------------------------------------------------------------------------

type RoomPlayer = {
  userId: number;
  displayName: string;
  score: number;
  rank: number;
};

type Subject = 'math' | 'science' | 'geography' | 'pshe';

type Room = {
  code: string;
  hostUserId: number;
  subject: Subject;
  topic: string;
  topicTitle: string;
  status: 'waiting' | 'active' | 'finished' | 'closed';
  round: number;
  maxRounds: number;
  durationSeconds: number;
  timeRemaining: number;
  players: RoomPlayer[];
};

type Question = {
  id: string;
  question: string;
  /** Emoji picture shown above the question, for math counting questions */
  image?: string;
  options: string[];
  correct: string;
};

type TopicOption = {
  key: string;
  title: string;
  count: number;
};

const MAX_ROUNDS = 3;

const SUBJECT_INFO: Record<Subject, { label: string; emoji: string; icon: typeof Calculator; lessons: Record<string, MathLesson> }> = {
  math: { label: 'Math', emoji: '\uD83D\uDD22', icon: Calculator, lessons: mathLessons },
  science: { label: 'Science', emoji: '\uD83D\uDD2C', icon: FlaskConical, lessons: scienceLessons },
  geography: { label: 'Geography', emoji: '\uD83D\uDDFA\uFE0F', icon: MapIcon, lessons: geographyLessons },
  pshe: { label: 'PSHE', emoji: '\uD83D\uDC9C', icon: Heart, lessons: psheLessons },
};

const SUBJECT_ORDER: Subject[] = ['math', 'science', 'geography', 'pshe'];

function getTopicsForSubject(subject: Subject): TopicOption[] {
  return Object.entries(SUBJECT_INFO[subject].lessons).map(([key, lesson]) => ({
    key,
    title: lesson.title,
    count: lesson.questions.length,
  }));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Builds one topic's question pool (the underlying lesson content is
// static, so each pool is cached after its first build).
const topicPoolCache = new Map<string, Question[]>();
function getTopicPool(subject: Subject, topicKey: string): Question[] {
  const cacheKey = `${subject}:${topicKey}`;
  const cached = topicPoolCache.get(cacheKey);
  if (cached) return cached;
  const lesson = SUBJECT_INFO[subject].lessons[topicKey];
  const pool: Question[] = lesson
    ? lesson.questions
        .filter((q) => !q.clockTime) // Live Race doesn't render an analog clock face
        .map((q) => ({ id: `${subject}:${topicKey}:${q.id}`, question: q.question, image: q.image, options: q.options, correct: q.correct }))
    : [];
  topicPoolCache.set(cacheKey, pool);
  return pool;
}

// The full question bank for a subject, across every topic in it (used as
// a backup pool — see pickQuestion below). Cached after first build since
// the underlying lesson content is static.
const subjectPoolCache = new Map<Subject, Question[]>();
function getSubjectPool(subject: Subject): Question[] {
  const cached = subjectPoolCache.get(subject);
  if (cached) return cached;
  const pool: Question[] = [];
  for (const [topicKey, lesson] of Object.entries(SUBJECT_INFO[subject].lessons)) {
    for (const q of lesson.questions) {
      if (q.clockTime) continue;
      pool.push({ id: `${subject}:${topicKey}:${q.id}`, question: q.question, image: q.image, options: q.options, correct: q.correct });
    }
  }
  subjectPoolCache.set(subject, pool);
  return pool;
}

// Picks the next question, chosen topic first: while the chosen topic still
// has unused questions, those are shown. A topic only has ~10 questions, so
// a very fast player can run through all of them well inside a 120s round —
// once that happens, rather than repeat anything, the game seamlessly pulls
// in fresh, still-unused questions from the rest of that SUBJECT's other
// topics (every subject already has 170-320+ real questions total), so
// nothing repeats at all within a round. The full subject-wide reset/repeat
// fallback below only matters if a player somehow burns through an entire
// subject's whole question bank in one round, which is not realistically
// reachable at human answering speed.
function pickQuestion(subject: Subject, topicKey: string, used: Set<string>, lastId: string | null): Question {
  const topicPool = getTopicPool(subject, topicKey);
  let available = topicPool.filter((q) => !used.has(q.id));

  if (available.length === 0) {
    const subjectPool = getSubjectPool(subject);
    available = subjectPool.filter((q) => !used.has(q.id) && q.id !== lastId);
  }
  if (available.length === 0) {
    // Extraordinarily unlikely — would mean the entire subject's question
    // bank was exhausted within one round. Reset and keep going rather
    // than crash or freeze the game.
    used.clear();
    const subjectPool = getSubjectPool(subject);
    available = subjectPool.filter((q) => q.id !== lastId);
    if (available.length === 0) available = subjectPool;
  }

  const picked = available[randomInt(0, available.length - 1)];
  used.add(picked.id);
  return { ...picked, options: shuffleArray(picked.options) };
}

async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

type Screen = 'menu' | 'host-select' | 'join' | 'lobby' | 'playing' | 'finished';

export default function GameLiveRace() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();

  const [screen, setScreen] = useState<Screen>('menu');
  const [hostSubject, setHostSubject] = useState<Subject>('math');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [myScore, setMyScore] = useState(0);
  // Tracks which questions have been shown THIS round, so nothing repeats
  // within a round — reset fresh at the start of every round (see
  // startRoundLocalState below). Combined with the topic-then-subject
  // fallback in pickQuestion, this means no repeats at all are realistically
  // possible within a single round, for any subject or topic.
  const usedSignaturesRef = useRef<Set<string>>(new Set());
  const lastQuestionIdRef = useRef<string | null>(null);

  const nextQuestion = useCallback((forRoom: Room) => {
    const q = pickQuestion(forRoom.subject, forRoom.topic, usedSignaturesRef.current, lastQuestionIdRef.current);
    lastQuestionIdRef.current = q.id;
    setCurrentQuestion(q);
  }, []);

  const startRoundLocalState = useCallback((forRoom: Room) => {
    usedSignaturesRef.current = new Set();
    lastQuestionIdRef.current = null;
    setMyScore(0);
    nextQuestion(forRoom);
  }, [nextQuestion]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Lets the polling callback below check the screen a guest is currently
  // on without being a dependency that would tear the interval down and
  // rebuild it every time the screen changes.
  const screenRef = useRef<Screen>('menu');
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refreshRoom = useCallback(async (code: string) => {
    try {
      const data = await apiCall<{ room: Room }>(`/live-race/rooms/${code}`);
      setRoom(data.room);
      // A guest sitting in the lobby only finds out the host started the
      // race through this poll — without this, their screen stayed on
      // "Waiting for the host to start the race…" forever even after the
      // host had already started (and finished) their own game.
      if (data.room.status === 'active' && screenRef.current === 'lobby') {
        startRoundLocalState(data.room);
        setScreen('playing');
      } else if ((data.room.status === 'finished' || data.room.status === 'closed') && screenRef.current !== 'finished') {
        setScreen('finished');
      } else if (data.room.status === 'waiting' && screenRef.current === 'finished') {
        // The host started the next round — bring everyone back to the lobby.
        setScreen('lobby');
      }
    } catch {
      // A transient poll failure isn't worth interrupting the game over —
      // it'll just try again on the next tick.
    }
  }, [startRoundLocalState]);

  useEffect(() => {
    if (!room || screen === 'menu') return;
    stopPolling();
    pollRef.current = setInterval(() => refreshRoom(room.code), 1500);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code, screen]);

  useEffect(() => stopPolling, [stopPolling]);

  const handleCreateRoom = async (subject: Subject, topic: TopicOption) => {
    setError('');
    setIsBusy(true);
    try {
      const data = await apiCall<{ room: Room }>('/live-race/rooms', {
        method: 'POST',
        body: JSON.stringify({ subject, topic: topic.key, topicTitle: topic.title }),
      });
      setRoom(data.room);
      setScreen('lobby');
      playSound('click');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a room.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleJoinRoom = async () => {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;
    setError('');
    setIsBusy(true);
    try {
      const data = await apiCall<{ room: Room }>(`/live-race/rooms/${code}/join`, { method: 'POST' });
      setRoom(data.room);
      setScreen(data.room.status === 'active' ? 'playing' : 'lobby');
      if (data.room.status === 'active') startRoundLocalState(data.room);
      playSound('click');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join that room.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleStartRace = async () => {
    if (!room) return;
    setIsBusy(true);
    try {
      const data = await apiCall<{ room: Room }>(`/live-race/rooms/${room.code}/start`, { method: 'POST' });
      setRoom(data.room);
      startRoundLocalState(data.room);
      setScreen('playing');
      playSound('click');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the race.');
    } finally {
      setIsBusy(false);
    }
  };

  // Starts the next round in the same room (same code) — the host-only
  // "Play Again" action. Every round gets a completely fresh local
  // question-tracking state (see startRoundLocalState), so nothing repeats
  // within that new round even though it replays the same topic.
  const handlePlayAgain = async () => {
    if (!room) return;
    setIsBusy(true);
    try {
      const data = await apiCall<{ room: Room }>(`/live-race/rooms/${room.code}/next-round`, { method: 'POST' });
      setRoom(data.room);
      setCurrentQuestion(null);
      setScreen('lobby');
      playSound('click');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the next round.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleAnswer = async (value: string) => {
    if (!room || !currentQuestion) return;
    const correct = value === currentQuestion.correct;
    if (correct) {
      setMyScore((s) => s + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    nextQuestion(room);
    try {
      const data = await apiCall<{ room: Room }>(`/live-race/rooms/${room.code}/answer`, {
        method: 'POST',
        body: JSON.stringify({ correct }),
      });
      setRoom(data.room);
      if (data.room.status === 'finished' || data.room.status === 'closed') {
        playSound('celebration');
        setScreen('finished');
      }
    } catch {
      // Keep playing locally even if a single score submission drops — the
      // next answer (or the next poll) will catch the server back up.
    }
  };

  const handleCopyCode = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the code is already shown on screen.
    }
  };

  const resetToMenu = () => {
    stopPolling();
    setRoom(null);
    setCurrentQuestion(null);
    setMyScore(0);
    setError('');
    usedSignaturesRef.current = new Set();
    lastQuestionIdRef.current = null;
    setScreen('menu');
  };

  const isHost = !!(room && user && room.hostUserId === user.id);
  const myRank = room?.players.find((p) => p.userId === user?.id)?.rank ?? null;

  // -------------------------------------------------------------------------
  // Menu screen — Host a Game / Join a Game
  // -------------------------------------------------------------------------
  if (screen === 'menu') {
    return (
      <div className="min-h-[100dvh] gradient-games p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/games">
            <Button variant="ghost" className="mb-6 rounded-full text-white hover:text-white" data-testid="button-back-games">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Games
            </Button>
          </Link>

          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow mb-2">Live Challenge</h1>
          <p className="text-lg text-white/90 font-semibold mb-8 max-w-2xl">
            Play together in real time — everyone answers at once, and the leaderboard updates instantly.
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm font-semibold mb-6 max-w-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.button
              onClick={() => setScreen('host-select')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-left bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl"
              data-testid="button-host-game"
            >
              <Crown className="w-10 h-10 text-white mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">Host a Game</h2>
              <p className="text-white/90 font-semibold">
                Pick a subject and topic, get a room code, and start when everyone's joined.
              </p>
            </motion.button>

            <motion.button
              onClick={() => setScreen('join')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-left bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-8 shadow-2xl"
              data-testid="button-join-game"
            >
              <Users className="w-10 h-10 text-white mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">Join a Game</h2>
              <p className="text-white/90 font-semibold">
                Got a room code from someone else? Enter it here.
              </p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Join screen — enter a room code
  // -------------------------------------------------------------------------
  if (screen === 'join') {
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <Button variant="ghost" className="mb-6 rounded-full text-white hover:text-white" onClick={() => setScreen('menu')} data-testid="button-back-menu">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-10 shadow-2xl border-4 border-white/50 text-center"
          >
            <Users className="w-14 h-14 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-foreground mb-2">Join a Game</h1>
            <p className="text-muted-foreground font-semibold mb-8">Enter the room code someone shared with you.</p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm font-semibold mb-6">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                maxLength={5}
                className="min-w-0 flex-1 text-center text-2xl font-black tracking-[0.3em] rounded-xl h-14"
                data-testid="input-join-code"
              />
              <Button
                onClick={handleJoinRoom}
                disabled={isBusy || !joinCodeInput.trim()}
                size="lg"
                className="rounded-xl h-14 font-black bg-blue-600 hover:bg-blue-700 text-white px-8"
                data-testid="button-join-room"
              >
                Join
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Host: subject + topic selection
  // -------------------------------------------------------------------------
  if (screen === 'host-select') {
    const topics = getTopicsForSubject(hostSubject);
    return (
      <div className="min-h-[100dvh] gradient-games p-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" className="mb-6 rounded-full text-white hover:text-white" onClick={() => setScreen('menu')} data-testid="button-back-menu">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <h1 className="text-4xl font-black text-white drop-shadow mb-2">Live Challenge</h1>
          <p className="text-lg text-white/90 font-semibold mb-8">
            Play together in real time — everyone answers at once, and the leaderboard updates instantly.
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm font-semibold mb-6 max-w-lg">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {SUBJECT_ORDER.map((subject) => {
              const info = SUBJECT_INFO[subject];
              const SubjectIcon = info.icon;
              const isSelected = hostSubject === subject;
              return (
                <button
                  key={subject}
                  onClick={() => setHostSubject(subject)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-sm border-2 transition-colors ${
                    isSelected
                      ? 'bg-white text-fuchsia-700 border-white shadow-lg'
                      : 'bg-white/15 text-white border-white/40 hover:bg-white/25'
                  }`}
                  data-testid={`subject-pill-${subject}`}
                >
                  <SubjectIcon className="w-4 h-4" />
                  {info.label}
                </button>
              );
            })}
          </div>

          {topics.length === 0 ? (
            <div className="bg-white/90 dark:bg-card/90 rounded-3xl p-12 text-center border-2 border-white/50">
              <p className="text-xl font-black text-foreground">More {SUBJECT_INFO[hostSubject].label} topics are coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topics.map((topic) => (
                <motion.button
                  key={topic.key}
                  onClick={() => handleCreateRoom(hostSubject, topic)}
                  disabled={isBusy}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="text-left bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 shadow-lg disabled:opacity-60"
                  data-testid={`topic-${topic.key}`}
                >
                  <div className="font-black text-white text-base leading-snug">{topic.title}</div>
                  <div className="text-white/80 font-semibold text-sm mt-1">{topic.count} questions</div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Lobby screen (waiting for players / host to start)
  // -------------------------------------------------------------------------
  if (screen === 'lobby' && room) {
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <Button variant="ghost" className="mb-6 rounded-full text-white hover:text-white" onClick={resetToMenu} data-testid="button-leave-lobby">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Leave Room
          </Button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-10 shadow-2xl border-4 border-white/50 text-center"
          >
            <p className="text-lg font-bold text-muted-foreground mb-2">Room Code</p>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-fuchsia-100 to-purple-100 dark:from-fuchsia-900 dark:to-purple-900 rounded-2xl px-8 py-4 mb-4 hover:scale-105 transition-transform"
              data-testid="button-copy-code"
            >
              <span className="text-5xl font-black tracking-[0.3em] text-foreground">{room.code}</span>
              {codeCopied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6 text-muted-foreground" />}
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-muted/70 rounded-full px-4 py-1.5 text-sm font-black text-muted-foreground">
                {SUBJECT_INFO[room.subject].emoji} {room.topicTitle}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-muted/70 rounded-full px-4 py-1.5 text-sm font-black text-muted-foreground">
                Round {room.round} of {room.maxRounds}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-5 h-5 text-muted-foreground" />
              <p className="font-bold text-muted-foreground">{room.players.length} player{room.players.length === 1 ? '' : 's'} joined</p>
            </div>

            <div className="space-y-2 mb-8 max-h-52 overflow-y-auto">
              <AnimatePresence>
                {room.players.map((p) => (
                  <motion.div
                    key={p.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3"
                  >
                    <span className="font-bold text-foreground flex items-center gap-2">
                      {p.userId === room.hostUserId && <Crown className="w-4 h-4 text-yellow-500" />}
                      {p.displayName}
                    </span>
                    {p.userId === user?.id && <span className="text-xs font-bold text-purple-600">You</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isHost ? (
              <Button
                onClick={handleStartRace}
                disabled={isBusy}
                size="lg"
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-black text-xl rounded-2xl h-16"
                data-testid="button-start-race"
              >
                <Zap className="w-6 h-6 mr-2" />
                Start Race
              </Button>
            ) : (
              <p className="text-muted-foreground font-semibold">Waiting for the host to start the race…</p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Playing screen (own question + live positions sidebar)
  // -------------------------------------------------------------------------
  if (screen === 'playing' && room && currentQuestion) {
    return (
      <div className="min-h-[100dvh] gradient-games pb-12">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-white font-black text-lg drop-shadow mb-4 flex items-center gap-3 flex-wrap">
            <span>{SUBJECT_INFO[room.subject].emoji} {room.topicTitle} — Room {room.code}</span>
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-sm">
              Round {room.round} of {room.maxRounds}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <motion.div
                  className="bg-white dark:bg-card rounded-2xl px-6 py-3 shadow-lg border-4 border-white/50"
                  animate={{ scale: room.timeRemaining <= 10 ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: room.timeRemaining <= 10 ? Infinity : 0 }}
                >
                  <div className="text-xs font-bold text-muted-foreground">Time Left</div>
                  <div className={`text-3xl font-black ${room.timeRemaining <= 10 ? 'text-red-600' : 'text-foreground'}`}>
                    {room.timeRemaining}s
                  </div>
                </motion.div>
                <div className="bg-white dark:bg-card rounded-2xl px-6 py-3 shadow-lg border-4 border-white/50">
                  <div className="text-xs font-bold text-muted-foreground">Your Score</div>
                  <div className="text-3xl font-black text-green-600">{myScore}</div>
                </div>
                {myRank && (
                  <div className="bg-white dark:bg-card rounded-2xl px-6 py-3 shadow-lg border-4 border-white/50">
                    <div className="text-xs font-bold text-muted-foreground">Your Rank</div>
                    <div className="text-3xl font-black text-purple-600">#{myRank}</div>
                  </div>
                )}
              </div>

              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-card rounded-3xl p-6 md:p-10 shadow-2xl border-4 border-white/50"
              >
                <h2 className="text-2xl md:text-3xl font-black text-foreground text-center mb-4 leading-snug">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.image && (
                  <div className="text-6xl text-center mb-6">{currentQuestion.image}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => (
                    <motion.button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="p-5 bg-gradient-to-br from-fuchsia-100 to-purple-100 dark:from-fuchsia-900 dark:to-purple-900 rounded-2xl text-base md:text-lg font-bold text-foreground hover:scale-105 transition-transform text-center leading-snug"
                      whileTap={{ scale: 0.95 }}
                      data-testid={`option-${option}`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Live positions sidebar */}
            <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-2xl border-4 border-white/50 h-fit">
              <h3 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Live Positions
              </h3>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {room.players.map((p) => (
                    <motion.div
                      key={p.userId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                        p.userId === user?.id ? 'bg-purple-100 dark:bg-purple-900' : 'bg-muted/50'
                      }`}
                    >
                      <span className="font-bold text-foreground flex items-center gap-2">
                        <span className="text-muted-foreground">#{p.rank}</span>
                        {p.displayName}
                      </span>
                      <span className="font-black text-foreground">{p.score}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Finished screen
  // -------------------------------------------------------------------------
  if (screen === 'finished' && room) {
    const winner = room.players[0];
    const roundsRemain = room.round < room.maxRounds && room.status !== 'closed';
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50 max-w-2xl w-full"
        >
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-5xl font-black text-foreground mb-2">Round {room.round} Finished!</h1>
          {winner && (
            <p className="text-2xl text-muted-foreground font-bold mb-4">
              🎉 {winner.displayName} wins with {winner.score} point{winner.score === 1 ? '' : 's'}!
            </p>
          )}
          <p className="text-sm font-bold text-muted-foreground mb-8">
            {roundsRemain
              ? `${SUBJECT_INFO[room.subject].label} · ${room.topicTitle} · Round ${room.round} of ${room.maxRounds} complete`
              : `All ${room.maxRounds} rounds complete — this room code is now closed`}
          </p>

          <div className="space-y-2 mb-8 max-h-64 overflow-y-auto">
            {room.players.map((p) => (
              <div
                key={p.userId}
                className={`flex items-center justify-between rounded-xl px-5 py-3 ${
                  p.userId === user?.id ? 'bg-purple-100 dark:bg-purple-900' : 'bg-muted/50'
                }`}
              >
                <span className="font-bold text-foreground flex items-center gap-2">
                  {p.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                  #{p.rank} {p.displayName}
                </span>
                <span className="font-black text-foreground text-lg">{p.score} pts</span>
              </div>
            ))}
          </div>

          {roundsRemain && (
            isHost ? (
              <Button
                onClick={handlePlayAgain}
                disabled={isBusy}
                size="lg"
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-black text-xl rounded-2xl h-16 mb-4"
                data-testid="button-play-again"
              >
                <Zap className="w-6 h-6 mr-2" />
                Play Again — Round {room.round + 1} of {room.maxRounds}
              </Button>
            ) : (
              <p className="text-muted-foreground font-semibold mb-4">
                Waiting for the host to start round {room.round + 1}…
              </p>
            )
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={resetToMenu}
              size="lg"
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-black rounded-2xl"
              data-testid="button-new-room"
            >
              New Room
            </Button>
            <Button
              onClick={() => setLocation('/games')}
              variant="outline"
              size="lg"
              className="font-black rounded-2xl"
              data-testid="button-back-to-games"
            >
              Games Menu
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
