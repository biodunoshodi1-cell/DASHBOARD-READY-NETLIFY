import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useGetTeacherDashboard } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, GraduationCap, TrendingUp, AlertCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetTeacherDashboard(user?.id || 0, {
    query: { enabled: !!user?.id },
  });

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/home">
            <Button variant="ghost" className="mb-4 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-card rounded-3xl p-4 shadow-lg">
              <GraduationCap className="w-16 h-16 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-foreground">Teacher Dashboard</h1>
              <p className="text-xl font-bold text-muted-foreground">Monitor Class Progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {isLoading && (
          <div className="bg-white dark:bg-card rounded-3xl p-12 text-center">
            <p className="text-xl text-muted-foreground font-semibold">Loading dashboard...</p>
          </div>
        )}

        {dashboard && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border text-center">
                <div className="text-5xl font-black text-purple-600 mb-2" data-testid="stat-total-students">{dashboard.totalStudents}</div>
                <div className="text-md font-bold text-muted-foreground">Total Students</div>
              </div>
              <div className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border text-center">
                <div className="text-5xl font-black text-green-600 mb-2" data-testid="stat-avg-accuracy">{dashboard.avgAccuracy.toFixed(0)}%</div>
                <div className="text-md font-bold text-muted-foreground">Average Accuracy</div>
              </div>
              <div className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border text-center">
                <div className="text-5xl font-black text-orange-600 mb-2" data-testid="stat-active-today">{dashboard.activeToday}</div>
                <div className="text-md font-bold text-muted-foreground">Active Today</div>
              </div>
            </div>

            {/* Subject Stats */}
            {dashboard.subjectStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
              >
                <h2 className="text-3xl font-black text-foreground mb-6">Class Performance by Subject</h2>
                <div className="space-y-4">
                  {dashboard.subjectStats.map((subject) => (
                    <div key={subject.subject}>
                      <div className="flex justify-between text-md font-bold text-foreground mb-1 capitalize">
                        <span>{subject.subject}</span>
                        <span>{subject.avgAccuracy.toFixed(0)}% avg · {subject.totalLessonsCompleted} lessons completed</span>
                      </div>
                      <Progress value={subject.avgAccuracy} className="h-3" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
              >
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-black text-foreground">Top Performers</h2>
                </div>
                {dashboard.topPerformers.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.topPerformers.map((student) => (
                      <div key={student.user.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl">
                        <div>
                          <p className="font-black text-foreground">{student.user.displayName}</p>
                          <p className="text-sm text-muted-foreground font-semibold">{student.lessonsCompleted} lessons completed</p>
                        </div>
                        <span className="text-2xl font-black text-green-600">{student.accuracy.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground font-semibold">No student data yet.</p>
                )}
              </motion.div>

              {/* Students Needing Help */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
              >
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-black text-foreground">May Need Support</h2>
                </div>
                {dashboard.studentsNeedingHelp.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.studentsNeedingHelp.map((student) => (
                      <div key={student.user.id} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/30 rounded-2xl">
                        <div>
                          <p className="font-black text-foreground">{student.user.displayName}</p>
                          <p className="text-sm text-muted-foreground font-semibold">{student.lessonsCompleted} lessons completed</p>
                        </div>
                        <span className="text-2xl font-black text-orange-600">{student.accuracy.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground font-semibold">No students flagged right now.</p>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
