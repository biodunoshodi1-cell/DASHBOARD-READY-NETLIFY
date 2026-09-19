import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import type { TypingResult } from './TypingEngine';

interface DictationEngineProps {
  items: string[];
  onComplete: (result: TypingResult) => void;
}

export function DictationEngine({ items, onComplete }: DictationEngineProps) {
  const { voiceSpeed, playSound } = useSettings();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const correctRef = useRef(0);
  const totalRef = useRef(0);
  const [startTime] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentItem = items[index] ?? '';
  const progressPercent = (index / items.length) * 100;

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentItem);
    utterance.rate = 0.75 * (voiceSpeed || 1);
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    inputRef.current?.focus();
    const t = setTimeout(speak, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

  const handleCheck = () => {
    if (checked) return;
    const correct = normalize(typed) === normalize(currentItem);
    setIsCorrect(correct);
    setChecked(true);
    totalRef.current += 1;
    if (correct) {
      correctRef.current += 1;
      playSound('correct');
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (index + 1 >= items.length) {
      const minutes = Math.max((Date.now() - startTime) / 60000, 1 / 60);
      const wordsTyped = items.join(' ').split(/\s+/).length;
      const accuracy = totalRef.current > 0 ? Math.round((correctRef.current / totalRef.current) * 100) : 100;
      onComplete({
        wpm: Math.max(1, Math.round(wordsTyped / minutes)),
        accuracy,
        correctChars: correctRef.current,
        incorrectChars: totalRef.current - correctRef.current,
      });
      return;
    }
    setIndex((i) => i + 1);
    setTyped('');
    setChecked(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
        <span>Dictation {index + 1} of {items.length}</span>
        <span data-testid="text-dictation-score">✅ {correctRef.current}/{totalRef.current}</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" animate={{ width: `${progressPercent}%` }} />
      </div>

      <div className="text-center py-8">
        <Button
          onClick={speak}
          size="lg"
          className="rounded-full w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 mb-6"
          data-testid="button-play-dictation"
        >
          <Volume2 className="w-10 h-10" />
        </Button>
        <p className="font-bold text-muted-foreground mb-4">Listen, then type what you hear</p>

        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !checked && handleCheck()}
          disabled={checked}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Type here…"
          className={`w-full max-w-md mx-auto block text-center text-2xl font-bold rounded-2xl border-4 px-4 py-3 focus:outline-none ${
            checked ? (isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-red-500 bg-red-50 dark:bg-red-950/30') : 'border-border bg-background focus:border-cyan-500'
          }`}
          data-testid="input-dictation"
        />

        {checked && !isCorrect && (
          <p className="mt-3 font-bold text-red-600 dark:text-red-400">
            The word was: <span className="underline">{currentItem}</span>
          </p>
        )}

        <div className="mt-6">
          {!checked ? (
            <Button onClick={handleCheck} size="lg" className="rounded-2xl font-black text-xl h-14 px-10" data-testid="button-check-dictation">
              Check
            </Button>
          ) : (
            <Button onClick={handleNext} size="lg" className="rounded-2xl font-black text-xl h-14 px-10 bg-gradient-to-r from-cyan-600 to-blue-600" data-testid="button-next-dictation">
              {index + 1 < items.length ? 'Next' : 'Finish'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
