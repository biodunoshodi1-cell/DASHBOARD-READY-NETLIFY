import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Eye, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { CelebrationPanel } from '@/components/CelebrationPanel';

// ---------------------------------------------------------------------------
// Brain Games — two short-term-memory challenges, Color Match and Number
// Memory: watch a sequence/number, then recall it once it's hidden. Both
// have 10 levels that can be played in ANY order — pick any level from the
// level-select screen, and failing a level never locks you out of trying a
// different one (or the same one again). Fully self-contained, no backend
// calls — just quick, replayable memory practice with warm feedback and a
// printable certificate when a level is won.
// ---------------------------------------------------------------------------

const TOTAL_LEVELS = 10;

type Screen = 'select' | 'playing';
type Phase = 'idle' | 'watching' | 'answering' | 'won';

const COLORS: { name: string; label: string; className: string }[] = [
  { name: 'red', label: 'Red', className: 'bg-red-500' },
  { name: 'blue', label: 'Blue', className: 'bg-blue-500' },
  { name: 'green', label: 'Green', className: 'bg-green-500' },
  { name: 'yellow', label: 'Yellow', className: 'bg-yellow-400' },
  { name: 'purple', label: 'Purple', className: 'bg-purple-500' },
  { name: 'orange', label: 'Orange', className: 'bg-orange-500' },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadCompleted(key: string): Set<number> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(key: string, completed: Set<number>) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(completed)));
  } catch {
    // Storage unavailable (e.g. private browsing) — not worth interrupting the game over.
  }
}

// Level-select grid shared by both games — pick ANY level, any time.
function LevelSelect({
  completed,
  accentClass,
  onPick,
}: {
  completed: Set<number>;
  accentClass: string;
  onPick: (level: number) => void;
}) {
  return (
    <div>
      <p className="text-center text-muted-foreground font-semibold mb-6">
        Pick any level to play — you can jump around and replay levels whenever you like.
      </p>
      <div className="grid grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((level) => {
          const isDone = completed.has(level);
          return (
            <motion.button
              key={level}
              onClick={() => onPick(level)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-black text-xl sm:text-2xl shadow-lg text-white ${
                isDone ? accentClass : 'bg-muted text-muted-foreground'
              }`}
              data-testid={`level-select-${level}`}
            >
              {isDone && <Star className="w-4 h-4 sm:w-5 sm:h-5 absolute top-1.5 right-1.5 fill-yellow-300 text-yellow-300" />}
              {level}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ColorMatchGame() {
  const { playSound } = useSettings();
  const [screen, setScreen] = useState<Screen>('select');
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState<Set<number>>(() => loadCompleted('brain-games-color-match'));

  const startLevel = (targetLevel: number) => {
    const length = targetLevel + 1;
    const next = Array.from({ length }, () => COLORS[randomInt(0, COLORS.length - 1)].name);
    setLevel(targetLevel);
    setSequence(next);
    setSlots(Array(length).fill(null));
    setMessage('');
    setPhase('watching');
    setScreen('playing');
    playSound('click');
    const watchTime = 1500 + length * 900;
    setTimeout(() => setPhase('answering'), watchTime);
  };

  const placeColor = (name: string) => {
    if (phase !== 'answering') return;
    const nextEmpty = slots.findIndex((s) => s === null);
    if (nextEmpty === -1) return;
    const updated = [...slots];
    updated[nextEmpty] = name;
    setSlots(updated);
    playSound('click');
  };

  const clearSlot = (index: number) => {
    if (phase !== 'answering') return;
    const updated = [...slots];
    updated[index] = null;
    setSlots(updated);
  };

  const checkAnswer = () => {
    if (slots.some((s) => s === null)) {
      setMessage('Fill every spot first!');
      return;
    }
    const correct = slots.every((s, i) => s === sequence[i]);
    if (correct) {
      playSound('correct');
      playSound('celebration');
      setPhase('won');
      setCompleted((prev) => {
        const next = new Set(prev).add(level);
        saveCompleted('brain-games-color-match', next);
        return next;
      });
    } else {
      playSound('wrong');
      setMessage('Not quite — tap a filled box to clear it and try again.');
    }
  };

  return (
    <div className="text-center">
      {screen === 'select' ? (
        <LevelSelect completed={completed} accentClass="bg-indigo-500" onPick={startLevel} />
      ) : phase === 'won' ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
          <CelebrationPanel activityTitle={`Color Match — Level ${level}`} scoreLabel={`Level ${level} of ${TOTAL_LEVELS} complete`} className="mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            {level < TOTAL_LEVELS && (
              <Button onClick={() => startLevel(level + 1)} size="lg" className="rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700">
                Next Level ({level + 1})
              </Button>
            )}
            <Button onClick={() => setScreen('select')} variant="outline" size="lg" className="rounded-2xl font-black">
              Choose Another Level
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button onClick={() => setScreen('select')} variant="ghost" size="sm" className="rounded-full" data-testid="button-back-to-levels">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Levels
            </Button>
            <p className="text-lg font-bold text-muted-foreground">
              Level {level} of {TOTAL_LEVELS} — remember {level + 1} colors
            </p>
            <div className="w-16" />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8 min-h-[80px] sm:min-h-[96px]">
            <AnimatePresence mode="wait">
              {phase === 'watching' &&
                sequence.map((name, i) => {
                  const color = COLORS.find((c) => c.name === name)!;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full shadow-lg ${color.className}`}
                    />
                  );
                })}
              {phase === 'answering' &&
                slots.map((filled, i) => {
                  const color = filled ? COLORS.find((c) => c.name === filled) : null;
                  return (
                    <motion.button
                      key={i}
                      onClick={() => clearSlot(i)}
                      whileTap={filled ? { scale: 0.9 } : {}}
                      className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full shadow-lg border-4 border-dashed border-muted-foreground/30 flex items-center justify-center text-2xl font-black text-muted-foreground ${
                        color ? color.className + ' border-solid border-white' : 'bg-muted/40'
                      }`}
                      data-testid={`slot-${i}`}
                    >
                      {!color && '?'}
                    </motion.button>
                  );
                })}
            </AnimatePresence>
          </div>

          {phase === 'watching' && (
            <p className="flex items-center justify-center gap-2 text-lg font-black text-indigo-600 mb-6">
              <Eye className="w-5 h-5" /> Watch closely!
            </p>
          )}

          {message && <p className="text-base font-bold text-orange-600 mb-4">{message}</p>}

          {phase === 'answering' && (
            <>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {COLORS.map((color) => (
                  <motion.button
                    key={color.name}
                    onClick={() => placeColor(color.name)}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-lg ${color.className}`}
                    aria-label={color.label}
                    data-testid={`palette-${color.name}`}
                  />
                ))}
              </div>
              <Button onClick={checkAnswer} size="lg" className="rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700">
                <Check className="w-5 h-5 mr-2" />
                Check My Answer
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function NumberMemoryGame() {
  const { playSound } = useSettings();
  const [screen, setScreen] = useState<Screen>('select');
  const [level, setLevel] = useState(1);
  const [answer, setAnswer] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState<Set<number>>(() => loadCompleted('brain-games-number-memory'));

  const startLevel = (targetLevel: number) => {
    const length = targetLevel + 2;
    let num = String(randomInt(1, 9));
    for (let i = 1; i < length; i++) num += String(randomInt(0, 9));
    setLevel(targetLevel);
    setAnswer(num);
    setDisplayValue(num);
    setInputValue('');
    setMessage('');
    setPhase('watching');
    setScreen('playing');
    playSound('click');
    const watchTime = 1200 + length * 900;
    setTimeout(() => {
      setDisplayValue('•'.repeat(length));
      setPhase('answering');
    }, watchTime);
  };

  const checkAnswer = () => {
    if (!inputValue.trim()) {
      setMessage('Type in the number first!');
      return;
    }
    if (inputValue.trim() === answer) {
      playSound('correct');
      playSound('celebration');
      setPhase('won');
      setCompleted((prev) => {
        const next = new Set(prev).add(level);
        saveCompleted('brain-games-number-memory', next);
        return next;
      });
    } else {
      playSound('wrong');
      setMessage(`Not quite — the number was ${answer}. Give this level another try, or pick a different one.`);
      setPhase('idle');
      setDisplayValue('');
    }
  };

  return (
    <div className="text-center">
      {screen === 'select' ? (
        <LevelSelect completed={completed} accentClass="bg-teal-500" onPick={startLevel} />
      ) : phase === 'won' ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
          <CelebrationPanel activityTitle={`Number Memory — Level ${level}`} scoreLabel={`Level ${level} of ${TOTAL_LEVELS} complete`} className="mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            {level < TOTAL_LEVELS && (
              <Button onClick={() => startLevel(level + 1)} size="lg" className="rounded-2xl font-black bg-teal-600 hover:bg-teal-700">
                Next Level ({level + 1})
              </Button>
            )}
            <Button onClick={() => setScreen('select')} variant="outline" size="lg" className="rounded-2xl font-black">
              Choose Another Level
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button onClick={() => setScreen('select')} variant="ghost" size="sm" className="rounded-full" data-testid="button-back-to-levels">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Levels
            </Button>
            <p className="text-lg font-bold text-muted-foreground">
              Level {level} of {TOTAL_LEVELS} — remember {level + 2} digits
            </p>
            <div className="w-16" />
          </div>

          {phase === 'idle' && message && (
            <div className="mb-4">
              <p className="text-base font-bold text-orange-600 mb-4">{message}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <Button onClick={() => startLevel(level)} size="lg" className="rounded-2xl font-black bg-teal-600 hover:bg-teal-700">
                  Try Level {level} Again
                </Button>
                <Button onClick={() => setScreen('select')} variant="outline" size="lg" className="rounded-2xl font-black">
                  Choose Another Level
                </Button>
              </div>
            </div>
          )}

          {phase !== 'idle' && (
            <>
              <div className="min-h-[100px] sm:min-h-[120px] flex items-center justify-center mb-6">
                <motion.div
                  key={displayValue}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl sm:text-7xl font-black text-teal-600 tracking-widest break-words px-2"
                >
                  {displayValue}
                </motion.div>
              </div>

              {phase === 'watching' && (
                <p className="flex items-center justify-center gap-2 text-lg font-black text-teal-600 mb-6">
                  <Eye className="w-5 h-5" /> Watch closely!
                </p>
              )}

              {phase === 'answering' && (
                <div className="max-w-xs mx-auto mb-6">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    placeholder="Type the number"
                    className="text-center text-2xl font-black tracking-widest rounded-xl h-14 mb-4"
                    data-testid="input-number-answer"
                  />
                  <Button onClick={checkAnswer} size="lg" className="w-full rounded-2xl font-black bg-teal-600 hover:bg-teal-700">
                    <Check className="w-5 h-5 mr-2" />
                    Check My Answer
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function GameBrainGames() {
  return (
    <div className="min-h-[100dvh] gradient-games pb-12">
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/games">
            <Button variant="ghost" className="mb-4 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Games
            </Button>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg shrink-0">
              <Brain className="w-10 h-10 sm:w-16 sm:h-16 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground truncate">Brain Games</h1>
              <p className="text-sm sm:text-lg md:text-xl font-bold text-muted-foreground truncate">
                Sharpen your memory, one round at a time
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-8">
        <Tabs defaultValue="color-match">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-white/20 backdrop-blur-sm p-1.5 h-auto rounded-full border-2 border-white/40">
              <TabsTrigger
                value="color-match"
                className="rounded-full px-6 py-2.5 font-black text-sm text-white/90 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg"
                data-testid="tab-color-match"
              >
                🎨 Color Match
              </TabsTrigger>
              <TabsTrigger
                value="number-memory"
                className="rounded-full px-6 py-2.5 font-black text-sm text-white/90 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-lg"
                data-testid="tab-number-memory"
              >
                🔢 Number Memory
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="color-match" className="mt-0">
            <div className="bg-white/95 dark:bg-card/95 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-white/50">
              <ColorMatchGame />
            </div>
          </TabsContent>
          <TabsContent value="number-memory" className="mt-0">
            <div className="bg-white/95 dark:bg-card/95 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-white/50">
              <NumberMemoryGame />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
