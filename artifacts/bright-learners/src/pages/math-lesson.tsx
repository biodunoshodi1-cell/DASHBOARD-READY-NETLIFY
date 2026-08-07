import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useRecordProgress } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { Brighty } from '@/components/Brighty';
import { AnalogClock } from '@/components/AnalogClock';
import { ArrowLeft, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { mathLessons } from '@/data/lessonContent';
import { ShapeGlyph } from '@/components/ShapeGlyph';
import { CountableDisplay } from '@/components/CountableDisplay';
import { shuffleQuestionsAndOptions } from '@/lib/shuffle';

const SHAPE_KEYWORDS = new Set(['triangle', 'square', 'rectangle', 'circle', 'pentagon', 'hexagon', 'cube', 'sphere']);

export default function MathLesson() {
  const params = useParams<{ topic: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const recordProgress = useRecordProgress();

  const topic = params.topic as keyof typeof mathLessons;
  const lesson = mathLessons[topic];

  // Shuffled once per visit (not on every re-render) so each attempt at a
  // lesson has a different question order and answer-button layout instead
  // of being identical every time - keeps repeat plays from feeling stale.
  const [questions] = useState(() => (lesson ? shuffleQuestionsAndOptions(lesson.questions) : []));

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());
  const [confetti, setConfetti] = useState(false);

  if (!lesson) {
    return <div className="p-6">Lesson not found</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      playSound('correct');
      setScore(score + 1);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      // Lesson complete
      const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
      const accuracy = (score / questions.length) * 100;
      
      if (user) {
        recordProgress.mutate({
          data: {
            userId: user.id,
            subject: 'math',
            lessonId: topic,
            lessonTitle: lesson.title,
            score,
            accuracy,
            timeSpentMinutes: Math.max(1, timeSpentMinutes),
          },
        });
      }

      playSound('celebration');
      setLocation('/math');
    }
  };

  return (
    <div className="min-h-[100dvh] gradient-math pb-12">
      <ConfettiEffect trigger={confetti} />

      {/* Header */}
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/math">
            <Button variant="ghost" className="mb-3 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-black text-foreground mb-3">{lesson.title}</h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>Score: {score}/{questions.length}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white dark:bg-card rounded-3xl p-8 shadow-2xl border-4 border-white/50"
          >
            {/* Question */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-foreground mb-4">{currentQuestion.question}</h2>
              {currentQuestion.clockTime && (
                <div className="my-8 flex justify-center">
                  <AnalogClock
                    hour={currentQuestion.clockTime.hour}
                    minute={currentQuestion.clockTime.minute}
                    size={220}
                  />
                </div>
              )}
              {!currentQuestion.clockTime && currentQuestion.countItems && (
                <div className="my-8">
                  <CountableDisplay countItems={currentQuestion.countItems} />
                </div>
              )}
              {!currentQuestion.clockTime && !currentQuestion.countItems && currentQuestion.image && (
                <div className="my-8 flex justify-center">
                  {SHAPE_KEYWORDS.has(currentQuestion.image) ? (
                    <ShapeGlyph shape={currentQuestion.image} className="text-6xl w-24 h-24" />
                  ) : (
                    <CountableDisplay image={currentQuestion.image} />
                  )}
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = option === currentQuestion.correct;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                    className={`relative p-8 rounded-2xl text-3xl font-black transition-all ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-foreground hover:scale-105'
                    }`}
                    whileHover={!showFeedback ? { scale: 1.05 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    data-testid={`option-${index}`}
                  >
                    {option}
                    {showCorrect && <CheckCircle2 className="absolute top-3 right-3 w-8 h-8" />}
                    {showWrong && <XCircle className="absolute top-3 right-3 w-8 h-8" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback & Actions */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-4">
                  <Brighty celebrating={isCorrect} size={80} />
                  <div
                    className={`text-2xl font-black ${
                      isCorrect ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {isCorrect ? 'Amazing! You got it!' : 'Not quite, but good try!'}
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xl rounded-2xl h-16"
                  data-testid="button-next"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Lesson'}
                </Button>
              </motion.div>
            )}

            {/* Hint Button */}
            {!showFeedback && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="outline"
                  className="w-full rounded-2xl font-bold"
                  data-testid="button-hint"
                >
                  <Lightbulb className="w-5 h-5 mr-2" />
                  {showHint ? 'Hide Hint' : 'Need a Hint?'}
                </Button>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-2xl p-4 text-center"
                  >
                    <p className="text-lg font-bold text-foreground">{currentQuestion.hint}</p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
