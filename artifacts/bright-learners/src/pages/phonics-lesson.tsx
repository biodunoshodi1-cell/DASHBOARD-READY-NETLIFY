import { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useRecordProgress } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { Brighty } from '@/components/Brighty';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, Delete } from 'lucide-react';
import { phonicsSounds, phonicsQuizzes } from '@/data/lessonContent';
import { shuffleQuestionsAndOptions } from '@/lib/shuffle';

type Mode = 'learn' | 'practice' | 'quiz';

const sectionMeta: Record<string, { sounds: typeof phonicsSounds.doubleVowels; title: string }> = {
  'double-vowels': { sounds: phonicsSounds.doubleVowels, title: 'Double Vowel Sounds' },
  'double-consonants': { sounds: phonicsSounds.doubleConsonants, title: 'Double Consonants' },
  'consonant-digraphs': { sounds: phonicsSounds.digraphs, title: 'Consonant Digraphs' },
};

// URL section slugs (kebab-case, above) don't match the phonicsQuizzes keys
// (camelCase, matching phonicsSounds' own key names) - this map bridges the
// two so the quiz page can find its questions instead of silently getting
// an empty list.
const sectionToQuizKey: Record<string, string> = {
  'double-vowels': 'doubleVowels',
  'double-consonants': 'doubleConsonants',
  'consonant-digraphs': 'digraphs',
};

export default function PhonicsLesson() {
  const params = useParams<{ section: string }>();
  const { playSound } = useSettings();
  const [selectedSound, setSelectedSound] = useState(0);
  const [mode, setMode] = useState<Mode>('learn');

  const section = params.section ?? '';
  const meta = sectionMeta[section];

  if (!meta) {
    return (
      <div className="min-h-[100dvh] gradient-phonics pb-12">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/phonics">
            <Button variant="ghost" className="mb-6 rounded-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Phonics
            </Button>
          </Link>
          <div className="bg-white dark:bg-card rounded-3xl p-12 text-center">
            <h1 className="text-4xl font-black text-foreground mb-4">Section not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const { sounds, title } = meta;
  const currentSound = sounds[selectedSound];

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentSound.example);
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
    playSound('click');
  };

  if (mode === 'practice') {
    return (
      <PracticeWriting
        section={section}
        title={title}
        sounds={sounds}
        startIndex={selectedSound}
        onExit={() => setMode('learn')}
      />
    );
  }

  if (mode === 'quiz') {
    return (
      <PhonicsQuiz
        section={sectionToQuizKey[section] ?? section}
        title={title}
        onExit={() => setMode('learn')}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] gradient-phonics pb-12">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/phonics">
          <Button variant="ghost" className="mb-6 rounded-full" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Phonics
          </Button>
        </Link>

        <h1 className="text-5xl font-black text-white drop-shadow-lg mb-8 text-center">{title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sound List */}
          <div className="lg:col-span-1 bg-white/90 dark:bg-card/90 rounded-3xl p-6 border-4 border-white/50">
            <h3 className="text-xl font-black text-foreground mb-4">Select a Sound</h3>
            <div className="space-y-2">
              {sounds.map((sound, index) => (
                <button
                  key={sound.id}
                  onClick={() => setSelectedSound(index)}
                  className={`w-full p-4 rounded-2xl font-black text-2xl transition-all ${
                    selectedSound === index
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                  data-testid={`sound-${sound.id}`}
                >
                  {sound.sound}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Display */}
          <div className="lg:col-span-2 bg-white/90 dark:bg-card/90 rounded-3xl p-10 border-4 border-white/50">
            <motion.div
              key={selectedSound}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-9xl font-black text-pink-600 mb-6">{currentSound.sound}</div>

              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-3xl p-8 mb-6">
                <p className="text-2xl font-bold text-muted-foreground mb-2">Example Word:</p>
                <p className="text-6xl font-black text-foreground mb-4">{currentSound.example}</p>
                <p className="text-xl font-bold text-muted-foreground">{currentSound.pronunciation}</p>
              </div>

              <Button
                onClick={speakWord}
                size="lg"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black text-2xl rounded-2xl h-20 mb-4"
                data-testid="button-listen"
              >
                <Volume2 className="w-8 h-8 mr-3" />
                Listen
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl font-bold text-lg"
                  onClick={() => setMode('practice')}
                  data-testid="button-practice"
                >
                  Practice Writing
                </Button>
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl font-bold text-lg"
                  onClick={() => setMode('quiz')}
                  data-testid="button-quiz"
                >
                  Take Quiz
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Practice Writing: spell the example word by tapping scrambled letter tiles
// in the right order. Tap-based rather than typed, so it works well for
// younger learners and touch/tablet use.
// ---------------------------------------------------------------------------
function shuffleLetters(word: string): string[] {
  const letters = word.toUpperCase().split('');
  const shuffled = [...letters];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Guard against an unlucky shuffle that lands on the exact original order.
  if (shuffled.join('') === letters.join('') && letters.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

function PracticeWriting({
  section,
  title,
  sounds,
  startIndex,
  onExit,
}: {
  section: string;
  title: string;
  sounds: typeof phonicsSounds.doubleVowels;
  startIndex: number;
  onExit: () => void;
}) {
  const { playSound } = useSettings();
  const [wordIndex, setWordIndex] = useState(startIndex);
  const [placed, setPlaced] = useState<number[]>([]); // indices into the tile array, in placement order
  const [completed, setCompleted] = useState(false);
  const [confetti, setConfetti] = useState(false);
  // Which tile is currently mid-shake (brief visual feedback for a wrong
  // tap) and whether to keep showing the "try again" message - the message
  // stays up (unlike the shake) until the next correct tap or Clear, so
  // it's clear the attempt was wrong rather than the tap doing nothing.
  const [shakeTileIndex, setShakeTileIndex] = useState<number | null>(null);
  const [showWrongMessage, setShowWrongMessage] = useState(false);

  const word = sounds[wordIndex].example.toUpperCase();
  const tiles = useMemo(() => shuffleLetters(sounds[wordIndex].example), [wordIndex]);

  const placedLetters = placed.map((i) => tiles[i]).join('');

  const handleTileTap = (tileIndex: number) => {
    if (completed || placed.includes(tileIndex)) return;

    const nextLetters = [...placed, tileIndex].map((i) => tiles[i]);
    const isStillCorrect = nextLetters.every((letter, pos) => letter === word[pos]);

    if (!isStillCorrect) {
      playSound('wrong');
      // Tile stays fully clickable/movable - this is only a visual cue
      // that this particular tap was wrong, not a lock on the tile.
      setShakeTileIndex(tileIndex);
      setShowWrongMessage(true);
      setTimeout(() => setShakeTileIndex(null), 400);
      return;
    }

    playSound('click');
    setShowWrongMessage(false);
    const newPlaced = [...placed, tileIndex];
    setPlaced(newPlaced);

    if (newPlaced.length === word.length) {
      playSound('celebration');
      setCompleted(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    }
  };

  const handleClear = () => {
    setPlaced([]);
    setShowWrongMessage(false);
    playSound('click');
  };

  const handleNextWord = () => {
    const next = (wordIndex + 1) % sounds.length;
    setWordIndex(next);
    setPlaced([]);
    setCompleted(false);
    setShowWrongMessage(false);
  };

  return (
    <div className="min-h-[100dvh] gradient-phonics pb-12">
      <ConfettiEffect trigger={confetti} />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Button variant="ghost" className="mb-6 rounded-full text-white" onClick={onExit} data-testid="button-back-practice">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to {title}
        </Button>

        <div className="bg-white dark:bg-card rounded-3xl p-10 shadow-2xl border-4 border-white/50 text-center">
          <p className="text-lg font-black uppercase tracking-wide text-muted-foreground mb-2">Practice Writing</p>
          <p className="text-xl font-bold text-muted-foreground mb-8">
            Tap the letters in order to spell the word for "{sounds[wordIndex].sound}"
          </p>

          {/* Answer slots */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {word.split('').map((letter, i) => (
              <div
                key={i}
                className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center text-4xl font-black ${
                  placedLetters[i]
                    ? 'bg-green-100 dark:bg-green-900 border-green-400 text-green-700 dark:text-green-300'
                    : 'bg-muted border-dashed border-muted-foreground/30 text-transparent'
                }`}
              >
                {placedLetters[i] ?? letter}
              </div>
            ))}
          </div>

          {!completed ? (
            <>
              {/* Persistent "wrong" message - stays visible (unlike the
                  brief tile shake) until the student places a correct
                  next letter or hits Clear, so it's clear this attempt
                  needs another try rather than looking unresponsive. */}
              <div className="h-8 mb-2">
                {showWrongMessage && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 font-black text-lg"
                    data-testid="text-wrong-answer"
                  >
                    Not quite — try again!
                  </motion.p>
                )}
              </div>

              {/* Letter tiles */}
              <div className="flex justify-center gap-3 mb-8 flex-wrap">
                {tiles.map((letter, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleTileTap(i)}
                    disabled={placed.includes(i)}
                    whileHover={!placed.includes(i) ? { scale: 1.08 } : {}}
                    whileTap={!placed.includes(i) ? { scale: 0.95 } : {}}
                    animate={shakeTileIndex === i ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                    transition={shakeTileIndex === i ? { duration: 0.4 } : undefined}
                    className={`w-16 h-16 rounded-2xl text-3xl font-black transition-colors ${
                      placed.includes(i)
                        ? 'bg-muted/40 text-transparent'
                        : shakeTileIndex === i
                          ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg'
                    }`}
                    data-testid={`letter-tile-${i}`}
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>

              <Button variant="outline" className="rounded-2xl font-bold" onClick={handleClear} data-testid="button-clear">
                <Delete className="w-5 h-5 mr-2" />
                Clear
              </Button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <Brighty celebrating size={80} />
                <div className="text-2xl font-black text-green-600">Great writing!</div>
              </div>
              <Button
                onClick={handleNextWord}
                size="lg"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black text-xl rounded-2xl h-16"
                data-testid="button-next-word"
              >
                Practice Another Word
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Take Quiz: multiple-choice — "Which word has this sound?" — through every
// sound in the section.
// ---------------------------------------------------------------------------
function PhonicsQuiz({ section, title, onExit }: { section: string; title: string; onExit: () => void }) {
  const { user } = useAuth();
  const { playSound } = useSettings();
  const recordProgress = useRecordProgress();

  // Shuffled once per quiz attempt so replaying the same section's quiz
  // gives a different question order and answer layout, not the same
  // static sequence every time.
  const [questions] = useState(() => shuffleQuestionsAndOptions(phonicsQuizzes[section] ?? []));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [confetti, setConfetti] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    setSelected(option);
    const correct = option === currentQuestion.correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      playSound('correct');
      setScore((s) => s + 1);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setShowFeedback(false);
      return;
    }

    const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
    const accuracy = (score / questions.length) * 100;
    if (user) {
      recordProgress.mutate({
        data: {
          userId: user.id,
          subject: 'phonics',
          lessonId: section,
          lessonTitle: title,
          score,
          accuracy,
          timeSpentMinutes: Math.max(1, timeSpentMinutes),
        },
      });
    }
    playSound('celebration');
    setFinished(true);
  };

  if (finished) {
    return (
      <div className="min-h-[100dvh] gradient-phonics flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl border-4 border-white/50 max-w-xl w-full"
        >
          <Brighty celebrating size={100} />
          <h1 className="text-4xl font-black text-foreground my-4">Quiz Complete!</h1>
          <p className="text-2xl font-bold text-muted-foreground mb-8">
            You scored {score} out of {questions.length}
          </p>
          <Button onClick={onExit} size="lg" className="w-full rounded-2xl font-black text-xl h-16" data-testid="button-finish-quiz">
            Back to {title}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] gradient-phonics pb-12">
      <ConfettiEffect trigger={confetti} />
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Button variant="ghost" className="mb-2 rounded-full" onClick={onExit} data-testid="button-back-quiz">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {title}
          </Button>
          <h1 className="text-2xl font-black text-foreground mb-3">{title} - Quiz</h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-muted-foreground">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>Score: {score}/{questions.length}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white dark:bg-card rounded-3xl p-8 shadow-2xl border-4 border-white/50"
          >
            <h2 className="text-3xl font-black text-foreground text-center mb-8">{currentQuestion.question}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selected === option;
                const isCorrectAnswer = option === currentQuestion.correct;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrect;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleSelect(option)}
                    disabled={showFeedback}
                    whileHover={!showFeedback ? { scale: 1.03 } : {}}
                    whileTap={!showFeedback ? { scale: 0.97 } : {}}
                    className={`relative p-6 rounded-2xl text-2xl font-black transition-all ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 text-foreground'
                    }`}
                    data-testid={`quiz-option-${index}`}
                  >
                    {option}
                    {showCorrect && <CheckCircle2 className="absolute top-3 right-3 w-6 h-6" />}
                    {showWrong && <XCircle className="absolute top-3 right-3 w-6 h-6" />}
                  </motion.button>
                );
              })}
            </div>

            {showFeedback && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="text-center text-xl font-bold text-muted-foreground">
                  {isCorrect ? 'Correct!' : currentQuestion.hint}
                </div>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black text-xl rounded-2xl h-16"
                  data-testid="button-next-quiz"
                >
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
