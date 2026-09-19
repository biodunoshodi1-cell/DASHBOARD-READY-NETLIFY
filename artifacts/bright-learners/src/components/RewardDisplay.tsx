import { motion } from 'framer-motion';
import { Star, Coins, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RewardDisplayProps {
  stars: number;
  coins: number;
  xp: number;
  level: number;
  xpToNextLevel: number;
  compact?: boolean;
}

export function RewardDisplay({ stars, coins, xp, level, xpToNextLevel, compact = false }: RewardDisplayProps) {
  const xpProgress = (xp / xpToNextLevel) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-lg">{stars}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-lg">{coins}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />
          <span className="font-bold text-lg">Lv {level}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-lg border-2 border-border">
      <div className="grid grid-cols-3 gap-6 mb-6">
        <motion.div
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Star className="w-12 h-12 text-yellow-500 fill-yellow-500 mx-auto mb-2" />
          </motion.div>
          <div className="text-3xl font-black text-foreground">{stars}</div>
          <div className="text-sm text-muted-foreground font-semibold">Stars</div>
        </motion.div>

        <motion.div
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="animate-spin-slow"
          >
            <Coins className="w-12 h-12 text-amber-600 mx-auto mb-2" />
          </motion.div>
          <div className="text-3xl font-black text-foreground">{coins}</div>
          <div className="text-sm text-muted-foreground font-semibold">Coins</div>
        </motion.div>

        <motion.div
          className="text-center"
          whileHover={{ scale: 1.05 }}
        >
          <Zap className="w-12 h-12 text-purple-600 fill-purple-600 mx-auto mb-2" />
          <div className="text-3xl font-black text-foreground">Lv {level}</div>
          <div className="text-sm text-muted-foreground font-semibold">Level</div>
        </motion.div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-muted-foreground">XP Progress</span>
          <span className="text-foreground">{xp} / {xpToNextLevel}</span>
        </div>
        <Progress value={xpProgress} className="h-3" />
      </div>
    </div>
  );
}
