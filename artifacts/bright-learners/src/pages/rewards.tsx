import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useGetUserRewards, useGetUserAchievements } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { RewardDisplay } from '@/components/RewardDisplay';
import { ArrowLeft, Award, Lock } from 'lucide-react';

const avatars = [
  { id: 'owl', name: 'Brighty Owl', emoji: '🦉', unlockLevel: 1 },
  { id: 'cat', name: 'Smart Cat', emoji: '🐱', unlockLevel: 3 },
  { id: 'dog', name: 'Happy Dog', emoji: '🐶', unlockLevel: 5 },
  { id: 'fox', name: 'Clever Fox', emoji: '🦊', unlockLevel: 7 },
  { id: 'panda', name: 'Wise Panda', emoji: '🐼', unlockLevel: 10 },
  { id: 'lion', name: 'Brave Lion', emoji: '🦁', unlockLevel: 15 },
];

export default function Rewards() {
  const { user } = useAuth();
  const { data: rewards } = useGetUserRewards(user?.id || 0, {
    query: { enabled: !!user?.id },
  });
  const { data: achievements } = useGetUserAchievements(user?.id || 0, {
    query: { enabled: !!user?.id },
  });

  return (
    <div className="min-h-[100dvh] gradient-rewards pb-12">
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
              <Award className="w-16 h-16 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">Rewards</h1>
              <p className="text-xl font-bold text-white/95 drop-shadow">Your Amazing Collection!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Current Rewards */}
        {rewards && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <RewardDisplay {...rewards} />
          </motion.div>
        )}

        {/* Avatars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
        >
          <h2 className="text-3xl font-black text-foreground mb-6">Choose Your Avatar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {avatars.map((avatar, index) => {
              const isUnlocked = (rewards?.level || 0) >= avatar.unlockLevel;
              const isActive = rewards?.activeAvatar === avatar.id;

              return (
                <motion.div
                  key={avatar.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white ring-4 ring-purple-600'
                      : isUnlocked
                      ? 'bg-muted hover:bg-muted/80'
                      : 'bg-gray-200 dark:bg-gray-800 opacity-50'
                  }`}
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                  data-testid={`avatar-${avatar.id}`}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="text-5xl mb-2">{avatar.emoji}</div>
                  <div className="text-sm font-bold">{avatar.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">Lv {avatar.unlockLevel}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border"
        >
          <h2 className="text-3xl font-black text-foreground mb-6">Achievements</h2>
          {achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((userAch, index) => (
                <motion.div
                  key={userAch.achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6"
                  data-testid={`achievement-${userAch.achievement.id}`}
                >
                  <div className="text-4xl mb-3">{userAch.achievement.icon}</div>
                  <h3 className="text-lg font-black text-foreground mb-1">{userAch.achievement.title}</h3>
                  <p className="text-sm text-muted-foreground font-semibold mb-3">{userAch.achievement.description}</p>
                  <div className="flex gap-2 text-xs font-bold">
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">+{userAch.achievement.coinsReward} coins</span>
                    <span className="bg-purple-400 text-purple-900 px-2 py-1 rounded-full">+{userAch.achievement.xpReward} XP</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground font-semibold">Complete lessons to unlock achievements!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
