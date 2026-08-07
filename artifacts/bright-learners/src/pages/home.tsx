import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useGetUserProgress, useGetUserRewards } from '@workspace/api-client-react';
import { Brighty } from '@/components/Brighty';
import { SubjectCard } from '@/components/SubjectCard';
import { RewardDisplay } from '@/components/RewardDisplay';
import { Button } from '@/components/ui/button';
import {
  Calculator,
  BookText,
  Volume2,
  Gamepad2,
  Award,
  Trophy,
  TrendingUp,
  Calendar,
  LayoutDashboard,
  Settings,
  LogOut,
} from 'lucide-react';

const greetings = ['Welcome back!', 'Let\'s learn!', 'Excellent work!', 'You\'re amazing!', 'Ready to shine?'];

export default function Home() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [greeting, setGreeting] = useState(greetings[0]);
  const { data: progress } = useGetUserProgress(user?.id || 0, {
    query: { enabled: !!user?.id },
  });
  const { data: rewards } = useGetUserRewards(user?.id || 0, {
    query: { enabled: !!user?.id },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      {/* Header */}
      <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-b-2 border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brighty size={60} />
            <div>
              <h2 className="text-2xl font-black text-foreground">Bright Learners</h2>
              <p className="text-sm text-muted-foreground font-semibold">{user?.displayName}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="rounded-full"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Greeting */}
        <motion.div
          key={greeting}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            {greeting}
          </h1>
          <p className="text-xl text-muted-foreground font-semibold">
            Ready for today's adventure?
          </p>
        </motion.div>

        {/* Rewards Display */}
        {rewards && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <RewardDisplay {...rewards} />
          </motion.div>
        )}

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SubjectCard
            title="Math"
            href="/math"
            gradient="gradient-math"
            icon={<Calculator className="w-16 h-16" />}
            description="Numbers & Problem Solving"
          />
          <SubjectCard
            title="English"
            href="/english"
            gradient="gradient-english"
            icon={<BookText className="w-16 h-16" />}
            description="Reading & Writing"
          />
          <SubjectCard
            title="Phonics"
            href="/phonics"
            gradient="gradient-phonics"
            icon={<Volume2 className="w-16 h-16" />}
            description="Sounds & Letters"
          />
          <SubjectCard
            title="Learning Games"
            href="/games"
            gradient="gradient-games"
            icon={<Gamepad2 className="w-16 h-16" />}
            description="Fun Challenges"
          />
          <SubjectCard
            title="Rewards"
            href="/rewards"
            gradient="gradient-rewards"
            icon={<Award className="w-16 h-16" />}
            description="Your Achievements"
          />
          <SubjectCard
            title="Achievements"
            href="/rewards"
            gradient="gradient-achievements"
            icon={<Trophy className="w-16 h-16" />}
            description="Badges & Trophies"
          />
          <SubjectCard
            title="Progress"
            href="/progress"
            gradient="gradient-progress"
            icon={<TrendingUp className="w-16 h-16" />}
            description="Track Your Growth"
          />
          <SubjectCard
            title="Daily Challenge"
            href="/daily-challenge"
            gradient="gradient-challenge"
            icon={<Calendar className="w-16 h-16" />}
            description="Today's Quest"
          />
          {user?.role !== 'student' && (
            <SubjectCard
              title={`${user?.role === 'parent' ? 'Parent' : user?.role === 'teacher' ? 'Teacher' : 'Admin'} Dashboard`}
              href={`/${user?.role}-dashboard`}
              gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
              icon={<LayoutDashboard className="w-16 h-16" />}
              description="Overview & Analytics"
            />
          )}
          <SubjectCard
            title="Settings"
            href="/settings"
            gradient="bg-gradient-to-br from-gray-600 to-gray-800"
            icon={<Settings className="w-16 h-16" />}
            description="Customize Your Experience"
          />
        </div>

        {/* Quick Stats */}
        {progress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white dark:bg-card rounded-2xl p-6 text-center border-2 border-border">
              <div className="text-4xl font-black text-purple-600 mb-1">{progress.totalLessonsCompleted}</div>
              <div className="text-sm font-bold text-muted-foreground">Lessons Complete</div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-6 text-center border-2 border-border">
              <div className="text-4xl font-black text-green-600 mb-1">{progress.overallAccuracy.toFixed(0)}%</div>
              <div className="text-sm font-bold text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-6 text-center border-2 border-border">
              <div className="text-4xl font-black text-orange-600 mb-1">{progress.currentStreak}</div>
              <div className="text-sm font-bold text-muted-foreground">Day Streak</div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-6 text-center border-2 border-border">
              <div className="text-4xl font-black text-blue-600 mb-1">{progress.totalTimeMinutes}</div>
              <div className="text-sm font-bold text-muted-foreground">Minutes Learning</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
