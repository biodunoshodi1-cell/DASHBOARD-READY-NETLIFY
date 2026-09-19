import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';

// ---------------------------------------------------------------------------
// Standard QWERTY layout with each key's finger assignment, for finger
// guidance highlighting. Colors map one-to-one with the 8 typing fingers
// (thumbs share the spacebar).
// ---------------------------------------------------------------------------
type Finger = 'l-pinky' | 'l-ring' | 'l-middle' | 'l-index' | 'thumb' | 'r-index' | 'r-middle' | 'r-ring' | 'r-pinky';

const FINGER_COLORS: Record<Finger, string> = {
  'l-pinky': '#f87171',
  'l-ring': '#fb923c',
  'l-middle': '#facc15',
  'l-index': '#4ade80',
  thumb: '#94a3b8',
  'r-index': '#22d3ee',
  'r-middle': '#60a5fa',
  'r-ring': '#a78bfa',
  'r-pinky': '#f472b6',
};

const FINGER_LABELS: Record<Finger, string> = {
  'l-pinky': 'Left pinky',
  'l-ring': 'Left ring finger',
  'l-middle': 'Left middle finger',
  'l-index': 'Left index finger',
  thumb: 'Thumb',
  'r-index': 'Right index finger',
  'r-middle': 'Right middle finger',
  'r-ring': 'Right ring finger',
  'r-pinky': 'Right pinky',
};

const KEY_ROWS: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const KEY_FINGER: Record<string, Finger> = {};
const assign = (keys: string[], finger: Finger) => keys.forEach((k) => (KEY_FINGER[k] = finger));
assign(['1', 'q', 'a', 'z'], 'l-pinky');
assign(['2', 'w', 's', 'x'], 'l-ring');
assign(['3', 'e', 'd', 'c'], 'l-middle');
assign(['4', '5', 'r', 't', 'f', 'g', 'v', 'b'], 'l-index');
assign(['6', '7', 'y', 'u', 'h', 'j', 'n', 'm'], 'r-index');
assign(['8', 'i', 'k', ','], 'r-middle');
assign(['9', 'o', 'l', '.'], 'r-ring');
assign(['0', 'p', ';', '/'], 'r-pinky');

function fingerForChar(char: string): Finger {
  if (char === ' ') return 'thumb';
  const lower = char.toLowerCase();
  const shiftMap: Record<string, string> = { '!': '1', '?': '/', "'": ';', '"': ';' };
  return KEY_FINGER[shiftMap[char] ?? lower] ?? 'r-index';
}

export type TypingResult = {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
};

interface TypingEngineProps {
  /** Words (or short sentences) the learner types, one at a time */
  items: string[];
  /** Called once every item has been typed, with the aggregate result */
  onComplete: (result: TypingResult) => void;
  /** Optional key set to visually introduce before typing starts */
  newKeys?: string[];
}

export function TypingEngine({ items, onComplete, newKeys = [] }: TypingEngineProps) {
  const { dyslexiaFont, showFingerGuide } = useSettings();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const correctRef = useRef(0);
  const incorrectRef = useRef(0);
  const [startTime] = useState(Date.now());
  const [activeChar, setActiveChar] = useState<string>(items[0]?.[0] ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentItem = items[index] ?? '';
  const progressPercent = (index / items.length) * 100;

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  const elapsedMinutes = Math.max((Date.now() - startTime) / 60000, 1 / 60);
  const totalTypedSoFar = correctChars + incorrectChars;
  const liveWpm = Math.round(totalTypedSoFar / 5 / elapsedMinutes);
  const liveAccuracy = totalTypedSoFar > 0 ? Math.round((correctChars / totalTypedSoFar) * 100) : 100;

  const handleChange = (value: string) => {
    if (value.length > currentItem.length) return; // ignore overtyping
    setTyped(value);
    const lastCharIndex = value.length - 1;
    if (lastCharIndex >= 0) {
      const isCorrect = value[lastCharIndex] === currentItem[lastCharIndex];
      if (isCorrect) {
        correctRef.current += 1;
        setCorrectChars((c) => c + 1);
      } else {
        incorrectRef.current += 1;
        setIncorrectChars((c) => c + 1);
      }
    }
    setActiveChar(currentItem[value.length] ?? currentItem[currentItem.length - 1] ?? '');

    if (value === currentItem) {
      setTimeout(() => {
        if (index + 1 >= items.length) {
          const finalCorrect = correctRef.current;
          const finalIncorrect = incorrectRef.current;
          const finalTotal = finalCorrect + finalIncorrect;
          const minutes = Math.max((Date.now() - startTime) / 60000, 1 / 60);
          onComplete({
            wpm: Math.max(1, Math.round(finalTotal / 5 / minutes)),
            accuracy: finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 100,
            correctChars: finalCorrect,
            incorrectChars: finalIncorrect,
          });
        } else {
          setIndex((i) => i + 1);
          setTyped('');
          setActiveChar(items[index + 1]?.[0] ?? '');
        }
      }, 250);
    }
  };

  const fingerFocus = useMemo(() => fingerForChar(activeChar || currentItem[0] || 'a'), [activeChar, currentItem]);

  return (
    <div className="space-y-6">
      {/* Live stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-bold text-muted-foreground">
        <span>Word {index + 1} of {items.length}</span>
        <span data-testid="text-live-wpm">⚡ {liveWpm} WPM</span>
        <span data-testid="text-live-accuracy">🎯 {liveAccuracy}% accurate</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          animate={{ width: `${progressPercent}%` }}
        />
      </div>

      {newKeys.length > 0 && index === 0 && typed.length === 0 && (
        <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-200 dark:border-purple-900 px-5 py-3 text-center">
          <p className="font-bold text-purple-800 dark:text-purple-200">
            New keys today: <span className="font-black text-lg">{newKeys.join('  ').toUpperCase()}</span>
          </p>
        </div>
      )}

      {/* Word display */}
      <div className={`text-center py-6 ${dyslexiaFont ? 'font-mono' : ''}`}>
        <div className="text-5xl sm:text-6xl font-black tracking-widest" data-testid="text-target-word">
          {currentItem.split('').map((ch, i) => {
            const state = i < typed.length ? (typed[i] === ch ? 'correct' : 'incorrect') : i === typed.length ? 'current' : 'pending';
            return (
              <span
                key={i}
                className={
                  state === 'correct'
                    ? 'text-green-500'
                    : state === 'incorrect'
                    ? 'text-red-500 underline'
                    : state === 'current'
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 rounded-lg px-0.5'
                    : 'text-muted-foreground'
                }
              >
                {ch === ' ' ? '\u00b7' : ch}
              </span>
            );
          })}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="mt-4 w-full max-w-md mx-auto block text-center text-2xl font-bold rounded-2xl border-4 border-border bg-background px-4 py-3 focus:outline-none focus:border-purple-500"
          data-testid="input-typing"
        />
      </div>

      {/* Virtual keyboard with finger guidance */}
      {showFingerGuide && (
        <div className="bg-white/60 dark:bg-card/60 rounded-3xl p-4 sm:p-6 border-2 border-border">
          <p className="text-center text-sm font-bold text-muted-foreground mb-3">
            Use your <span style={{ color: FINGER_COLORS[fingerFocus] }}>{FINGER_LABELS[fingerFocus]}</span>
          </p>
          <div className="space-y-1.5 max-w-xl mx-auto">
            {KEY_ROWS.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-1.5">
                {row.map((k) => {
                  const finger = KEY_FINGER[k];
                  const isFocus = k === (activeChar || '').toLowerCase();
                  return (
                    <div
                      key={k}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-black uppercase transition-transform"
                      style={{
                        backgroundColor: finger ? FINGER_COLORS[finger] : '#e2e8f0',
                        opacity: isFocus ? 1 : 0.35,
                        transform: isFocus ? 'scale(1.2)' : 'scale(1)',
                        color: 'white',
                        boxShadow: isFocus ? '0 0 0 3px rgba(0,0,0,0.15)' : 'none',
                      }}
                      data-testid={`key-${k}`}
                    >
                      {k}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex justify-center pt-1">
              <div
                className="h-8 sm:h-9 w-40 sm:w-56 rounded-lg flex items-center justify-center text-xs font-black"
                style={{
                  backgroundColor: FINGER_COLORS.thumb,
                  opacity: activeChar === ' ' ? 1 : 0.35,
                  transform: activeChar === ' ' ? 'scale(1.08)' : 'scale(1)',
                  color: 'white',
                }}
                data-testid="key-space"
              >
                SPACE
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
