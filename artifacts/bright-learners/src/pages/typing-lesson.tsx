import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Keyboard, Volume2, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { Brighty } from '@/components/Brighty';
import { TypingEngine, type TypingResult } from '@/components/TypingEngine';
import { DictationEngine } from '@/components/DictationEngine';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useRecordProgress } from '@workspace/api-client-react';
import { findModule } from '@/data/typingContent';

type Phase = 'intro' | 'drill' | 'dictation' | 'results';

export default function TypingLesson() {
  const params = useParams<{ levelId: string; moduleId: string }>();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const recordProgress = useRecordProgress();

  const found = findModule(params.levelId ?? '', params.moduleId ?? '');
  const [phase, setPhase] = useState<Phase>('intro');
  const [drillResult, setDrillResult] = useState<TypingResult | null>(null);
  const [dictationResult, setDictationResult] = useState<TypingResult | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [startTime] = useState(Date.now());

  if (!found) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-card rounded-3xl p-12 text-center">
          <h1 className="text-3xl font-black text-foreground mb-4">Module not found</h1>
          <Link href="/typing">
            <Button className="rounded-2xl">Back to Typing</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { level, module } = found;
  const dictationItems = module.sentences && module.sentences.length > 0 ? [...module.words.slice(0, 5), ...module.sentences] : module.words;

  const handleDrillComplete = (result: TypingResult) => {
    setDrillResult(result);
    playSound('correct');
    setPhase('dictation');
  };

  const handleDictationComplete = (result: TypingResult) => {
    setDictationResult(result);
    const drill = drillResult ?? { wpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0 };
    const timeSpentMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const combinedAccuracy = Math.round((drill.accuracy + result.accuracy) / 2);
    if (user) {
      recordProgress.mutate({
        data: {
          userId: user.id,
          subject: 'typing',
          lessonId: `${level.id}-${module.id}`,
          lessonTitle: module.title,
          score: drill.wpm,
          accuracy: combinedAccuracy,
          timeSpentMinutes,
        },
      });
    }
    playSound('celebration');
    setConfetti(true);
    setTimeout(() => setConfetti(false), 100);
    setPhase('results');
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <ConfettiEffect trigger={confetti} />
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/typing">
            <Button variant="ghost" className="mb-2 rounded-full" data-testid="button-back-lesson">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Typing
            </Button>
          </Link>
          <h1 className="text-2xl font-black text-foreground">
            {level.title} — {module.title}
          </h1>
          <p className="text-sm font-bold text-muted-foreground">{module.pattern}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-card rounded-3xl p-8 sm:p-10 text-center shadow-2xl border-4 border-white/50"
            >
              <Brighty size={90} />
              <h2 className="text-3xl font-black text-foreground mt-4 mb-2">{module.title}</h2>
              <p className="text-lg font-semibold text-muted-foreground mb-6">{module.pattern}</p>
              {module.newKeys.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {module.newKeys.map((k) => (
                    <span key={k} className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-black flex items-center justify-center uppercase" data-testid={`intro-key-${k}`}>
                      {k === 'space' ? '␣' : k}
                    </span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-purple-50 dark:bg-purple-950/40 rounded-2xl p-4">
                  <Keyboard className="w-6 h-6 text-purple-600 mb-1" />
                  <p className="font-bold text-sm text-muted-foreground">Type {module.words.length} words with finger guidance</p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl p-4">
                  <Volume2 className="w-6 h-6 text-cyan-600 mb-1" />
                  <p className="font-bold text-sm text-muted-foreground">Listen and spell {dictationItems.length} items by ear</p>
                </div>
              </div>
              <Button
                onClick={() => setPhase('drill')}
                size="lg"
                className="w-full rounded-2xl font-black text-xl h-16 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
                data-testid="button-start-lesson"
              >
                Start Typing
              </Button>
            </motion.div>
          )}

          {phase === 'drill' && (
            <motion.div key="drill" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white dark:bg-card rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-white/50">
              <TypingEngine items={module.words} newKeys={module.newKeys} onComplete={handleDrillComplete} />
            </motion.div>
          )}

          {phase === 'dictation' && (
            <motion.div key="dictation" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-white dark:bg-card rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-white/50">
              <DictationEngine items={dictationItems} onComplete={handleDictationComplete} />
            </motion.div>
          )}

          {phase === 'results' && drillResult && dictationResult && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-card rounded-3xl p-8 sm:p-10 text-center shadow-2xl border-4 border-white/50">
              <Brighty celebrating size={100} />
              <h2 className="text-3xl font-black text-foreground mt-4 mb-6">Module Complete!</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-purple-50 dark:bg-purple-950/40 rounded-2xl p-5">
                  <Zap className="w-7 h-7 text-purple-600 mx-auto mb-1" />
                  <div className="text-3xl font-black text-foreground" data-testid="text-final-wpm">{drillResult.wpm}</div>
                  <div className="text-xs font-bold text-muted-foreground">Words Per Minute</div>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl p-5">
                  <Target className="w-7 h-7 text-cyan-600 mx-auto mb-1" />
                  <div className="text-3xl font-black text-foreground" data-testid="text-final-accuracy">
                    {Math.round((drillResult.accuracy + dictationResult.accuracy) / 2)}%
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">Overall Accuracy</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/typing" className="flex-1">
                  <Button size="lg" className="w-full rounded-2xl font-black text-lg h-14" data-testid="button-finish-lesson">
                    Back to Typing
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-2xl font-black text-lg h-14"
                  onClick={() => {
                    setPhase('intro');
                    setDrillResult(null);
                    setDictationResult(null);
                  }}
                  data-testid="button-retry-lesson"
                >
                  Practice Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
