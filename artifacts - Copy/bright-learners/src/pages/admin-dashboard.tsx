import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useGetAdminDashboard } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, Gamepad2 } from 'lucide-react';

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();

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
              <ShieldCheck className="w-16 h-16 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-foreground">Admin Dashboard</h1>
              <p className="text-xl font-bold text-muted-foreground">Platform-Wide Overview</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border text-center">
                <div className="text-4xl font-black text-purple-600 mb-1" data-testid="stat-students">{dashboard.totalStudents}</div>
                <div className="text-sm font-bold text-muted-foreground">Students</div>
              </div>
              <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border text-center">
                <div className="text-4xl font-black text-indigo-600 mb-1" data-testid="stat-teachers">{dashboard.totalTeachers}</div>
                <div className="text-sm font-bold text-muted-foreground">Teachers</div>
              </div>
              <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border text-center">
                <div className="text-4xl font-black text-pink-600 mb-1" data-testid="stat-parents">{dashboard.totalParents}</div>
                <div className="text-sm font-bold text-muted-foreground">Parents</div>
              </div>
              <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border text-center">
                <div className="text-4xl font-black text-orange-600 mb-1" data-testid="stat-active-today">{dashboard.activeToday}</div>
                <div className="text-sm font-bold text-muted-foreground">Active Today</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border text-center">
                <div className="text-5xl font-black text-green-600 mb-2" data-testid="stat-lessons-completed">{dashboard.totalLessonsCompleted}</div>
                <div className="text-md font-bold text-muted-foreground">Total Lessons Completed</div>
              </div>
              <div className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border text-center">
                <div className="text-5xl font-black text-blue-600 mb-2" data-testid="stat-avg-accuracy">{dashboard.avgAccuracy.toFixed(0)}%</div>
                <div className="text-md font-bold text-muted-foreground">Platform Average Accuracy</div>
              </div>
              <div className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border text-center">
                <div className="text-5xl font-black text-rose-600 mb-2" data-testid="stat-registrations">{dashboard.registrationsThisWeek}</div>
                <div className="text-md font-bold text-muted-foreground">New Signups This Week</div>
              </div>
            </div>

            {/* Top Games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
            >
              <div className="flex items-center gap-2 mb-6">
                <Gamepad2 className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-black text-foreground">Most Played Games</h2>
              </div>
              {dashboard.topGames.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.topGames.map((game) => (
                    <div key={game.game} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 rounded-2xl">
                      <p className="font-black text-foreground capitalize">{game.game.replace(/-/g, ' ')}</p>
                      <div className="flex gap-6 text-right">
                        <div>
                          <p className="text-lg font-black text-purple-600">{game.timesPlayed}</p>
                          <p className="text-xs font-bold text-muted-foreground">plays</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-purple-600">{game.avgScore}</p>
                          <p className="text-xs font-bold text-muted-foreground">avg score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground font-semibold">No games played yet.</p>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
