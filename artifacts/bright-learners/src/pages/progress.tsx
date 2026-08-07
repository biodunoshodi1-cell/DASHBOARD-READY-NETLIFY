import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGetUserProgress,
  useGetWeeklyProgress,
  useGetSubjectProgress,
  useListCompletedLessons,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, TrendingUp, Target, Clock, Flame } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressPage() {
  const { user } = useAuth();
  const { data: progress } = useGetUserProgress(user?.id || 0, {
    query: { enabled: !!user?.id },
  });
  const { data: weeklyProgress } = useGetWeeklyProgress(user?.id || 0, {
    query: { enabled: !!user?.id },
  });
  const { data: subjectProgress } = useGetSubjectProgress(user?.id || 0, {
    query: { enabled: !!user?.id },
  });
  const { data: completedLessons } = useListCompletedLessons(user?.id || 0, undefined, {
    query: { enabled: !!user?.id },
  });

  return (
    <div className="min-h-[100dvh] gradient-progress pb-12">
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/home">
            <Button variant="ghost" className="mb-4 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-card rounded-3xl p-4 shadow-lg">
              <TrendingUp className="w-16 h-16 text-green-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">Progress</h1>
              <p className="text-xl font-bold text-white/95 drop-shadow">Track Your Learning Journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Stats Grid */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-8 h-8 text-purple-600" />
                <h3 className="font-black text-muted-foreground">Total Lessons</h3>
              </div>
              <div className="text-5xl font-black text-foreground">{progress.totalLessonsCompleted}</div>
            </div>

            <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <h3 className="font-black text-muted-foreground">Accuracy</h3>
              </div>
              <div className="text-5xl font-black text-foreground">{progress.overallAccuracy.toFixed(0)}%</div>
            </div>

            <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <h3 className="font-black text-muted-foreground">Learning Time</h3>
              </div>
              <div className="text-5xl font-black text-foreground">{progress.totalTimeMinutes}<span className="text-2xl">m</span></div>
            </div>

            <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-8 h-8 text-orange-600" />
                <h3 className="font-black text-muted-foreground">Current Streak</h3>
              </div>
              <div className="text-5xl font-black text-foreground">{progress.currentStreak}<span className="text-2xl">d</span></div>
            </div>
          </motion.div>
        )}

        {/* Weekly Activity Chart */}
        {weeklyProgress && weeklyProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
          >
            <h2 className="text-3xl font-black text-foreground mb-6">Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="lessonsCompleted" stroke="#8b5cf6" strokeWidth={3} name="Lessons" />
                <Line type="monotone" dataKey="timeMinutes" stroke="#3b82f6" strokeWidth={3} name="Minutes" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Subject Progress */}
        {subjectProgress && subjectProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
          >
            <h2 className="text-3xl font-black text-foreground mb-6">Subject Performance</h2>
            <div className="space-y-6">
              {subjectProgress.map((subject) => (
                <div key={subject.subject} data-testid={`subject-${subject.subject}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-black text-foreground capitalize">{subject.subject}</h3>
                    <div className="text-sm font-bold text-muted-foreground">
                      {subject.lessonsCompleted} / {subject.totalLessons} lessons
                    </div>
                  </div>
                  <Progress value={(subject.lessonsCompleted / subject.totalLessons) * 100} className="h-4 mb-2" />
                  <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                    <span>Accuracy: {subject.accuracy.toFixed(0)}%</span>
                    <span>Time: {subject.timeMinutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Lessons */}
        {completedLessons && completedLessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
          >
            <h2 className="text-3xl font-black text-foreground mb-6">Recent Lessons</h2>
            <div className="space-y-3">
              {completedLessons.slice(0, 10).map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex justify-between items-center p-4 bg-muted rounded-2xl"
                  data-testid={`lesson-${lesson.id}`}
                >
                  <div>
                    <h3 className="font-bold text-foreground">{lesson.lessonTitle}</h3>
                    <p className="text-sm text-muted-foreground font-semibold capitalize">{lesson.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-green-600">{lesson.accuracy.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground font-semibold">{lesson.timeSpentMinutes} min</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
