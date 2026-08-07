import { useState } from 'react';
import { useParams, useLocation, useSearch, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useRecordProgress } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { Brighty } from '@/components/Brighty';
import { ArrowLeft, BookOpen, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import {
  englishStories,
  readingPassages,
  comprehensionPassages,
  englishQuizzes,
  type EnglishPassage,
  type QuizQuestion,
} from '@/data/lessonContent';

const passagesByTopic: Record<string, { passages: EnglishPassage[]; heading: string }> = {
  stories: { passages: englishStories, heading: 'Stories' },
  reading: { passages: readingPassages, heading: 'Reading' },
  comprehension: { passages: comprehensionPassages, heading: 'Comprehension' },
};

export default function EnglishLesson() {
  const params = useParams<{ topic: string }>();
  const topic = params.topic;

  if (topic && passagesByTopic[topic]) {
    return <PassageLesson topic={topic} />;
  }

  if (topic && englishQuizzes[topic]) {
    return <QuizLesson topic={topic} />;
  }

  return (
    <div className="min-h-[100dvh] gradient-english pb-12">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/english">
          <Button variant="ghost" className="mb-6 rounded-full">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to English
          </Button>
        </Link>
        <div className="bg-white dark:bg-card rounded-3xl p-12 text-center">
          <h1 className="text-4xl font-black text-foreground mb-4">Lesson not found</h1>
          <p className="text-xl text-muted-foreground font-semibold">
            That topic doesn't exist yet. Head back and pick another one!
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Passage-based lessons: read a short text, then answer questions about it.
// Used by Stories, Reading, and Comprehension.
// ---------------------------------------------------------------------------
function PassageLesson({ topic }: { topic: string }) {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const recordProgress = useRecordProgress();

  const yearParam = Number(new URLSearchParams(search).get('year'));
  const { passages: allPassages, heading } = passagesByTopic[topic];
  // Only show passages written for the selected year group. Falls back to
  // the full list if no valid year was supplied (e.g. a stale/direct link).
  const passages =
    yearParam >= 1 && yearParam <= 6
      ? allPassages.filter((p) => p.year === yearParam)
      : allPassages;

  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [showPassage, setShowPassage] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [confetti, setConfetti] = useState(false);

  const passage = passages[currentPassageIndex];

  if (!passage) {
    return (
      <div className="min-h-[100dvh] gradient-english pb-12">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/english">
            <Button variant="ghost" className="mb-6 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to English
            </Button>
          </Link>
          <div className="bg-white dark:bg-card rounded-3xl p-12 text-center">
            <h1 className="text-4xl font-black text-foreground mb-4">No lessons here yet</h1>
            <p className="text-xl text-muted-foreground font-semibold">
              This year group doesn't have {heading.toLowerCase()} lessons yet. Head back and pick another one!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = passage.questions[currentQuestionIndex];
  const totalQuestions = passage.questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleStartQuestions = () => {
    setShowPassage(false);
    playSound('click');
  };

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
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
      const accuracy = (score / totalQuestions) * 100;

      if (user) {
        recordProgress.mutate({
          data: {
            userId: user.id,
            subject: 'english',
            lessonId: passage.id,
            lessonTitle: passage.title,
            score,
            accuracy,
            timeSpentMinutes: Math.max(1, timeSpentMinutes),
          },
        });
      }

      playSound('celebration');

      if (currentPassageIndex < passages.length - 1) {
        setCurrentPassageIndex(currentPassageIndex + 1);
        setShowPassage(true);
        setCurrentQuestionIndex(0);
        setScore(0);
      } else {
        setLocation('/english');
      }
    }
  };

  if (showPassage) {
    return (
      <div className="min-h-[100dvh] gradient-english pb-12">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/english">
            <Button variant="ghost" className="mb-6 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to English
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card rounded-3xl p-10 shadow-2xl border-4 border-white/50"
          >
            <div className="flex items-center gap-4 mb-6">
              <BookOpen className="w-12 h-12 text-blue-600" />
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">{heading}</p>
                <h1 className="text-4xl font-black text-foreground">{passage.title}</h1>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-xl leading-relaxed text-foreground font-medium">{passage.content}</p>
            </div>

            <Button
              onClick={handleStartQuestions}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xl rounded-2xl h-16"
              data-testid="button-start-questions"
            >
              <Volume2 className="w-6 h-6 mr-2" />
              Answer Questions
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] gradient-english pb-12">
      <ConfettiEffect trigger={confetti} />

      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-black text-foreground mb-3">{passage.title} - Questions</h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>Score: {score}/{totalQuestions}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white dark:bg-card rounded-3xl p-8 shadow-2xl border-4 border-white/50"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-foreground">{currentQuestion.question}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
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
                    className={`relative p-6 rounded-2xl text-xl font-bold text-left transition-all ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-foreground hover:scale-102'
                    }`}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    data-testid={`option-${index}`}
                  >
                    {option}
                    {showCorrect && <CheckCircle2 className="absolute top-4 right-4 w-7 h-7" />}
                    {showWrong && <XCircle className="absolute top-4 right-4 w-7 h-7" />}
                  </motion.button>
                );
              })}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-4">
                  <Brighty celebrating={isCorrect} size={80} />
                  <div className={`text-2xl font-black ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                    {isCorrect ? 'Perfect! Great reading!' : 'Good try! Read it again.'}
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xl rounded-2xl h-16"
                  data-testid="button-next"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quiz-based lessons: straight multiple-choice questions, no passage.
// Used by Vocabulary, Grammar, and Sentence Building.
// ---------------------------------------------------------------------------
function QuizLesson({ topic }: { topic: string }) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();
  const recordProgress = useRecordProgress();

  const { title, questions } = englishQuizzes[topic];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [confetti, setConfetti] = useState(false);

  const currentQuestion: QuizQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

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
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      return;
    }

    const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
    const accuracy = (score / totalQuestions) * 100;

    if (user) {
      recordProgress.mutate({
        data: {
          userId: user.id,
          subject: 'english',
          lessonId: topic,
          lessonTitle: title,
          score,
          accuracy,
          timeSpentMinutes: Math.max(1, timeSpentMinutes),
        },
      });
    }

    playSound('celebration');
    setLocation('/english');
  };

  return (
    <div className="min-h-[100dvh] gradient-english pb-12">
      <ConfettiEffect trigger={confetti} />

      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/english">
            <Button variant="ghost" className="mb-2 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to English
            </Button>
          </Link>
          <h1 className="text-3xl font-black text-foreground mb-3">{title}</h1>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>Score: {score}/{totalQuestions}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white dark:bg-card rounded-3xl p-8 shadow-2xl border-4 border-white/50"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-foreground">{currentQuestion.question}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
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
                    className={`relative p-6 rounded-2xl text-xl font-bold text-left transition-all ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-foreground hover:scale-102'
                    }`}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    data-testid={`option-${index}`}
                  >
                    {option}
                    {showCorrect && <CheckCircle2 className="absolute top-4 right-4 w-7 h-7" />}
                    {showWrong && <XCircle className="absolute top-4 right-4 w-7 h-7" />}
                  </motion.button>
                );
              })}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-4">
                  <Brighty celebrating={isCorrect} size={80} />
                  <div className={`text-2xl font-black ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                    {isCorrect ? 'Correct! Well done!' : currentQuestion.hint}
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xl rounded-2xl h-16"
                  data-testid="button-next"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
