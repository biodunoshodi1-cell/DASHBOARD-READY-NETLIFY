import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useGetTodayChallenge, useSubmitDailyChallenge, useGetDailyChallengeStatus } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { Brighty } from '@/components/Brighty';
import { ArrowLeft, Calendar, CheckCircle2, Trophy } from 'lucide-react';

export default function DailyChallenge() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { playSound } = useSettings();
  
  const { data: challenge } = useGetTodayChallenge();
  const { data: status } = useGetDailyChallengeStatus(user?.id || 0, {
    query: { enabled: !!user?.id },
  });
  const submitChallenge = useSubmitDailyChallenge();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!challenge || status?.completed) {
    return (
      <div className="min-h-[100dvh] gradient-challenge flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Link href="/home">
            <Button variant="ghost" className="mb-6 rounded-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl"
          >
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-black text-foreground mb-4">Challenge Complete!</h1>
            <p className="text-xl text-muted-foreground font-semibold">
              {status?.completed
                ? `You scored ${status.score}/15! Come back tomorrow for a new challenge.`
                : 'Loading today\'s challenge...'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const allQuestions = [
    ...challenge.mathQuestions,
    ...challenge.englishQuestions,
    ...challenge.phonicsQuestions,
  ];
  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;

    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setAnswers({ ...answers, [currentQuestion.id]: answer });

    if (correct) {
      playSound('correct');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    } else {
      // Submit challenge
      if (user) {
        const answersList = Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        }));

        submitChallenge.mutate({
          data: {
            userId: user.id,
            date: challenge.date,
            answers: answersList,
          },
        });
      }
      setIsComplete(true);
      playSound('celebration');
    }
  };

  if (isComplete) {
    const correctCount = Object.entries(answers).filter(([id, answer]) => {
      const q = allQuestions.find((q) => q.id === id);
      return q && answer === q.correctAnswer;
    }).length;

    return (
      <div className="min-h-[100dvh] gradient-challenge flex items-center justify-center p-6">
        <ConfettiEffect trigger={true} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl max-w-2xl w-full"
        >
          <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 mb-4">
            Daily Champion!
          </h1>
          <div className="text-8xl font-black text-foreground mb-6">{correctCount}/{totalQuestions}</div>
          <p className="text-2xl text-muted-foreground font-bold mb-8">Questions Correct!</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-2xl p-4">
              <p className="text-sm font-bold text-muted-foreground mb-1">Coins</p>
              <p className="text-3xl font-black text-foreground">{correctCount * 10}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-4">
              <p className="text-sm font-bold text-muted-foreground mb-1">Stars</p>
              <p className="text-3xl font-black text-foreground">{Math.floor(correctCount / 2)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-2xl p-4">
              <p className="text-sm font-bold text-muted-foreground mb-1">XP</p>
              <p className="text-3xl font-black text-foreground">{correctCount * 20}</p>
            </div>
          </div>
          <Button
            onClick={() => setLocation('/home')}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-black text-xl rounded-2xl h-16"
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] gradient-challenge pb-12">
      <ConfettiEffect trigger={confetti} />

      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-8 h-8 text-foreground" />
            <h1 className="text-3xl font-black text-foreground">Daily Challenge</h1>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{currentQuestion.subject.toUpperCase()}</span>
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
                const isSelected = answers[currentQuestion.id] === option;
                const isCorrectAnswer = option === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className={`relative p-6 rounded-2xl text-xl font-bold text-left transition-all ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900 dark:to-pink-900 text-foreground hover:scale-102'
                    }`}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  >
                    {option}
                    {showCorrect && <CheckCircle2 className="absolute top-4 right-4 w-7 h-7" />}
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
                    {isCorrect ? 'Awesome!' : 'Good try!'}
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-black text-xl rounded-2xl h-16"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Challenge'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
