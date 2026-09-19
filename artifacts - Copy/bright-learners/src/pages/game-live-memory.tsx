import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trophy, Zap, Users, Copy, Check, Crown } from 'lucide-react';

// ---------------------------------------------------------------------------
// Live Memory — a turn-based multiplayer memory-match game for up to 4
// players, joined by room code. Everyone shares the same board; the server
// is the source of truth for whose turn it is and what's been matched.
// Entirely self-contained: talks only to its own /api/live-memory/*
// endpoints, doesn't touch or reuse state from any other game.
// ---------------------------------------------------------------------------

type RoomPlayer = {
  userId: number;
  displayName: string;
  score: number;
  rank: number;
};

type RoomCard = {
  state: 'hidden' | 'revealed' | 'matched';
  value: string | null;
};

type LastReveal = {
  indices: number[];
  values: string[];
  matched: boolean;
} | null;

type Room = {
  code: string;
  hostUserId: number;
  status: 'waiting' | 'active' | 'finished';
  players: RoomPlayer[];
  playerCount: number;
  maxPlayers: number;
  currentTurnUserId: number | null;
  cards: RoomCard[];
  lastReveal: LastReveal;
};

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

type Screen = 'menu' | 'lobby' | 'playing' | 'finished';

export default function GameLiveMemory() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();

  const [screen, setScreen] = useState<Screen>('menu');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  // Cards currently shown face-up on screen even after the server has
  // already flipped them back — gives players a beat to see a mismatch
  // before the board resets, instead of it vanishing instantly on the poll.
  const [flashCards, setFlashCards] = useState<{ indices: number[]; values: string[] } | null>(null);
  const lastRevealKeyRef = useRef<string>('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const applyReveal = useCallback(
    (lastReveal: LastReveal) => {
      if (!lastReveal) return;
      const key = `${lastReveal.indices.join(',')}-${lastReveal.values.join(',')}-${lastReveal.matched}`;
      if (key === lastRevealKeyRef.current) return;
      lastRevealKeyRef.current = key;
      setFlashCards({ indices: lastReveal.indices, values: lastReveal.values });
      playSound(lastReveal.matched ? 'correct' : 'wrong');
      setTimeout(() => setFlashCards(null), 1100);
    },
    [playSound],
  );

  const refreshRoom = useCallback(
    async (code: string) => {
      try {
        const data = await apiCall<{ room: Room }>(`/live-memory/rooms/${code}`);
        setRoom(data.room);
        applyReveal(data.room.lastReveal);

        if (data.room.status === 'active' && screenRef.current === 'lobby') {
          setScreen('playing');
          playSound('click');
        } else if (data.room.status === 'finished' && screenRef.current !== 'finished') {
          playSound('celebration');
          setScreen('finished');
        }
      } catch {
        // A transient poll failure isn't worth interrupting the game over —
        // it'll just try again on the next tick.
      }
    },
    [applyReveal, playSound],
  );

  useEffect(() => {
    if (!room || screen === 'menu') return;
    stopPolling();
    pollRef.current = setInterval(() => refreshRoom(room.code), 1200);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code, screen]);

  useEffect(() => stopPolling, [stopPolling]);

  const handleCreateRoom = async () => {
    setError('');
    setIsBusy(true);
    try {
      const data = await apiCall<{ room: Room }>('/live-memory/rooms', { method: 'POST' });
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
      const data = await apiCall<{ room: Room }>(`/live-memory/rooms/${code}/join`, { method: 'POST' });
      setRoom(data.room);
      setScreen(data.room.status === 'active' ? 'playing' : 'lobby');
      playSound('click');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join that room.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleStartGame = async () => {
    if (!room) return;
    setIsBusy(true);
    try {
      const data = await apiCall<{ room: Room }>(`/live-memory/rooms/${room.code}/start`, { method: 'POST' });
      setRoom(data.room);
      setScreen('playing');
      playSound('click');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the game.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleFlip = async (index: number) => {
    if (!room) return;
    const card = room.cards[index];
    if (card.state !== 'hidden') return;
    if (room.currentTurnUserId !== user?.id) return;

    // Optimistically flip it face-up locally so the tap feels instant;
    // the response (or next poll) reconciles with the real state.
    setRoom({
      ...room,
      cards: room.cards.map((c, i) => (i === index ? { ...c, state: 'revealed' } : c)),
    });
    playSound('click');

    try {
      const data = await apiCall<{ room: Room }>(`/live-memory/rooms/${room.code}/flip`, {
        method: 'POST',
        body: JSON.stringify({ index }),
      });
      setRoom(data.room);
      applyReveal(data.room.lastReveal);
      if (data.room.status === 'finished') {
        playSound('celebration');
        setScreen('finished');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That move didn\u2019t go through — try again.');
      refreshRoom(room.code);
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
    setError('');
    setFlashCards(null);
    lastRevealKeyRef.current = '';
    setScreen('menu');
  };

  const isHost = !!(room && user && room.hostUserId === user.id);
  const isMyTurn = !!(room && user && room.currentTurnUserId === user.id);
  const myTurnPlayerName = room?.players.find((p) => p.userId === room.currentTurnUserId)?.displayName;

  // -------------------------------------------------------------------------
  // Menu screen
  // -------------------------------------------------------------------------
  if (screen === 'menu') {
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <Link href="/games">
            <Button variant="ghost" className="mb-6 rounded-full text-white hover:text-white" data-testid="button-back-games">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Games
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-10 shadow-2xl border-4 border-white/50 text-center"
          >
            <div className="text-7xl mb-4">🧠</div>
            <h1 className="text-4xl font-black text-foreground mb-2">Live Memory</h1>
            <p className="text-lg text-muted-foreground font-semibold mb-8">
              Play memory match live with up to 4 friends! Take turns flipping cards — everyone earns a point for each pair they match.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm font-semibold mb-6">
                {error}
              </div>
            )}

            <Button
              onClick={handleCreateRoom}
              disabled={isBusy}
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xl rounded-2xl h-16 mb-6"
              data-testid="button-create-room"
            >
              <Zap className="w-6 h-6 mr-2" />
              Create a Room
            </Button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-bold text-muted-foreground">OR JOIN ONE</span>
              <div className="flex-1 h-px bg-border" />
            </div>

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
                className="rounded-xl h-14 font-black bg-teal-600 hover:bg-teal-700 text-white px-8"
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
  // Lobby screen
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
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-2xl px-8 py-4 mb-8 hover:scale-105 transition-transform"
              data-testid="button-copy-code"
            >
              <span className="text-5xl font-black tracking-[0.3em] text-foreground">{room.code}</span>
              {codeCopied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6 text-muted-foreground" />}
            </button>

            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-5 h-5 text-muted-foreground" />
              <p className="font-bold text-muted-foreground">{room.playerCount} of {room.maxPlayers} players joined</p>
            </div>

            <div className="space-y-2 mb-8">
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
                    {p.userId === user?.id && <span className="text-xs font-bold text-teal-600">You</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isHost ? (
              <Button
                onClick={handleStartGame}
                disabled={isBusy || room.playerCount < 2}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xl rounded-2xl h-16 disabled:opacity-60"
                data-testid="button-start-game"
              >
                <Zap className="w-6 h-6 mr-2" />
                {room.playerCount < 2 ? 'Need 2+ Players' : 'Start Game'}
              </Button>
            ) : (
              <p className="text-muted-foreground font-semibold">Waiting for the host to start the game…</p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Playing screen
  // -------------------------------------------------------------------------
  if (screen === 'playing' && room) {
    return (
      <div className="min-h-[100dvh] gradient-games pb-12">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="text-white font-black text-lg drop-shadow mb-4">Live Memory — Room {room.code}</div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                key={isMyTurn ? 'my-turn' : 'their-turn'}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl px-6 py-3 mb-4 text-center font-black text-lg shadow-lg border-4 border-white/50 ${
                  isMyTurn ? 'bg-white text-teal-700' : 'bg-white/80 text-muted-foreground'
                }`}
              >
                {isMyTurn ? "It's your turn — flip a card!" : `Waiting for ${myTurnPlayerName ?? 'the other player'}\u2026`}
              </motion.div>

              <div className="bg-white dark:bg-card rounded-3xl p-4 md:p-6 shadow-2xl border-4 border-white/50">
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {room.cards.map((card, index) => {
                    const flashed = flashCards?.indices.includes(index);
                    const displayValue = card.value ?? (flashed ? flashCards?.values[flashCards.indices.indexOf(index)] : null);
                    const faceUp = card.state !== 'hidden' || flashed;
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleFlip(index)}
                        disabled={!isMyTurn || card.state !== 'hidden'}
                        whileTap={isMyTurn && card.state === 'hidden' ? { scale: 0.95 } : {}}
                        className={`aspect-square rounded-xl md:rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black transition-colors ${
                          card.state === 'matched'
                            ? 'bg-green-100 dark:bg-green-900'
                            : faceUp
                              ? 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900'
                              : isMyTurn
                                ? 'bg-gradient-to-br from-teal-500 to-emerald-600 hover:scale-105 cursor-pointer'
                                : 'bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800'
                        }`}
                        data-testid={`card-${index}`}
                      >
                        {faceUp ? displayValue : ''}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live scoreboard */}
            <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-2xl border-4 border-white/50 h-fit">
              <h3 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Live Scores
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
                        p.userId === room.currentTurnUserId
                          ? 'bg-teal-100 dark:bg-teal-900 ring-2 ring-teal-400'
                          : p.userId === user?.id
                            ? 'bg-emerald-50 dark:bg-emerald-950'
                            : 'bg-muted/50'
                      }`}
                    >
                      <span className="font-bold text-foreground flex items-center gap-2">
                        <span className="text-muted-foreground">#{p.rank}</span>
                        {p.displayName}
                        {p.userId === room.currentTurnUserId && <span className="text-xs text-teal-600 font-black">TURN</span>}
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
    return (
      <div className="min-h-[100dvh] gradient-games flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50 max-w-2xl w-full"
        >
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-5xl font-black text-foreground mb-2">All Matched!</h1>
          {winner && (
            <p className="text-2xl text-muted-foreground font-bold mb-8">
              🎉 {winner.displayName} wins with {winner.score} match{winner.score === 1 ? '' : 'es'}!
            </p>
          )}

          <div className="space-y-2 mb-8">
            {room.players.map((p) => (
              <div
                key={p.userId}
                className={`flex items-center justify-between rounded-xl px-5 py-3 ${
                  p.userId === user?.id ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-muted/50'
                }`}
              >
                <span className="font-bold text-foreground flex items-center gap-2">
                  {p.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                  #{p.rank} {p.displayName}
                </span>
                <span className="font-black text-foreground text-lg">{p.score} match{p.score === 1 ? '' : 'es'}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={resetToMenu}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl"
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
