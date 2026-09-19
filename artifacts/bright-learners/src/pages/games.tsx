import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Gamepad2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const games = [
  { id: 'math-sprint', name: 'Math Sprint', description: 'Answer fast, score high!', icon: '🏃', color: 'from-red-400 to-orange-500' },
  { id: 'memory', name: 'Memory Match', description: 'Find matching pairs', icon: '🧠', color: 'from-orange-400 to-yellow-500' },
  { id: 'word-builder', name: 'Word Builder', description: 'Build words from letters', icon: '🔤', color: 'from-yellow-400 to-green-500' },
  { id: 'balloon-pop', name: 'Balloon Pop', description: 'Pop the correct answers', icon: '🎈', color: 'from-green-400 to-teal-500' },
  { id: 'treasure-hunt', name: 'Treasure Hunt', description: 'Find hidden answers', icon: '🏴‍☠️', color: 'from-teal-400 to-cyan-500' },
  { id: 'picture-puzzle', name: 'Picture Puzzle', description: 'Complete the image', icon: '🧩', color: 'from-cyan-400 to-blue-500' },
  { id: 'shape-match', name: 'Shape Match', description: 'Match shapes & colors', icon: '🔷', color: 'from-blue-400 to-indigo-500' },
  { id: 'letter-match', name: 'Letter Match', description: 'Match uppercase & lowercase', icon: '🔠', color: 'from-indigo-400 to-purple-500' },
  { id: 'sentence-builder', name: 'Sentence Builder', description: 'Build proper sentences', icon: '📝', color: 'from-purple-400 to-pink-500' },
  { id: 'number-puzzle', name: 'Number Puzzle', description: 'Solve math mysteries', icon: '🔢', color: 'from-pink-400 to-rose-500' },
  { id: 'times-tables', name: 'Times Tables Rock Stars', description: 'Practice, sprint, and battle friends live!', icon: '🎸', color: 'from-fuchsia-600 to-indigo-700' },
  { id: 'live-race', name: 'Live Challenge', description: 'Compete live with a room code!', icon: '🏆', color: 'from-fuchsia-500 to-purple-600' },
  { id: 'live-memory', name: 'Live Memory', description: 'Match pairs live with up to 4 friends!', icon: '🧠', color: 'from-emerald-500 to-teal-600' },
  { id: 'brain-games', name: 'Brain Games', description: 'Sharpen your memory with color & number challenges!', icon: '🎯', color: 'from-indigo-500 to-purple-600' },
];

export default function Games() {
  return (
    <div className="min-h-[100dvh] gradient-games pb-12">
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/home">
            <Button variant="ghost" className="mb-4 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg shrink-0">
              <Gamepad2 className="w-10 h-10 sm:w-16 sm:h-16 text-cyan-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg truncate">Learning Games</h1>
              <p className="text-sm sm:text-lg md:text-xl font-bold text-white/95 drop-shadow truncate">Fun Challenges Await!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/games/${game.id}`}>
                <motion.div
                  className={`bg-gradient-to-br ${game.color} rounded-3xl p-8 shadow-xl cursor-pointer border-4 border-white/50 relative overflow-hidden`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`game-${game.id}`}
                >
                  <div className="text-7xl mb-4 text-center">{game.icon}</div>
                  <h3 className="text-2xl font-black text-white text-center mb-2">{game.name}</h3>
                  <p className="text-sm font-bold text-white/90 text-center mb-4">{game.description}</p>
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm text-white font-black px-6 py-3 rounded-full">
                      <Play className="w-5 h-5" />
                      Play Now
                    </span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
