import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useGetParentDashboard } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ParentDashboard() {
  const { user } = useAuth();
  const { data: dashboard } = useGetParentDashboard(user?.id || 0, {
    query: { enabled: !!user?.id },
  });

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/home">
            <Button variant="ghost" className="mb-4 rounded-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-card rounded-3xl p-4 shadow-lg">
              <Users className="w-16 h-16 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-foreground">Parent Dashboard</h1>
              <p className="text-xl font-bold text-muted-foreground">Monitor Your Children's Progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {dashboard?.children && dashboard.children.length > 0 ? (
          <>
            {/* Children Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboard.children.map((child, index) => (
                <motion.div
                  key={child.user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl font-black text-white">
                      {child.user.displayName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-foreground">{child.user.displayName}</h3>
                      <p className="text-sm text-muted-foreground font-semibold">Grade {child.user.gradeLevel || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-black text-purple-600">{child.progress.totalLessonsCompleted}</div>
                      <div className="text-xs font-bold text-muted-foreground">Lessons</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-green-600">{child.progress.overallAccuracy.toFixed(0)}%</div>
                      <div className="text-xs font-bold text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-orange-600">{child.progress.currentStreak}</div>
                      <div className="text-xs font-bold text-muted-foreground">Streak</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {child.subjectBreakdown.map((subject) => (
                      <div key={subject.subject}>
                        <div className="flex justify-between text-sm font-bold text-foreground mb-1 capitalize">
                          <span>{subject.subject}</span>
                          <span>{subject.accuracy.toFixed(0)}%</span>
                        </div>
                        <Progress value={(subject.lessonsCompleted / subject.totalLessons) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Weekly Activity */}
            {dashboard.weeklyActivity && dashboard.weeklyActivity.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
              >
                <h2 className="text-3xl font-black text-foreground mb-6">Weekly Activity</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboard.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="lessonsCompleted" stroke="#8b5cf6" strokeWidth={3} name="Lessons" />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-card rounded-3xl p-12 text-center">
            <p className="text-xl text-muted-foreground font-semibold">No children linked to this account yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
