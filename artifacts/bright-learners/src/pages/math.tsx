import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useListCompletedLessons } from '@workspace/api-client-react';

const mathTopics = [
  { id: 'counting', title: 'Counting', icon: '🔢', color: 'from-red-400 to-orange-500' },
  { id: 'addition', title: 'Addition', icon: '➕', color: 'from-orange-400 to-yellow-500' },
  { id: 'subtraction', title: 'Subtraction', icon: '➖', color: 'from-yellow-400 to-green-500' },
  { id: 'multiplication', title: 'Multiplication', icon: '✖️', color: 'from-green-400 to-teal-500' },
  { id: 'division', title: 'Division', icon: '➗', color: 'from-teal-400 to-cyan-500' },
  { id: 'fractions', title: 'Fractions', icon: '½', color: 'from-cyan-400 to-blue-500' },
  { id: 'money', title: 'Money', icon: '💰', color: 'from-blue-400 to-indigo-500' },
  { id: 'time', title: 'Time', icon: '⏰', color: 'from-indigo-400 to-purple-500' },
  { id: 'shapes', title: 'Shapes', icon: '🔷', color: 'from-purple-400 to-pink-500' },
  { id: 'measurements', title: 'Measurements', icon: '📏', color: 'from-pink-400 to-rose-500' },
  { id: 'word-problems', title: 'Word Problems', icon: '📝', color: 'from-rose-400 to-red-500' },
];

export default function Math() {
  const { user } = useAuth();
  const { data: completedLessons } = useListCompletedLessons(
    user?.id || 0,
    { subject: 'math' },
    { query: { enabled: !!user?.id } },
  );
  const completedTopicIds = new Set((completedLessons ?? []).map((l) => l.lessonId));
  return (
    <div className="min-h-[100dvh] gradient-math pb-12">
      {/* Header */}
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
              <Calculator className="w-16 h-16 text-orange-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">Math</h1>
              <p className="text-xl font-bold text-white/95 drop-shadow">Numbers & Problem Solving</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathTopics.map((topic, index) => {
            const progress = completedTopicIds.has(topic.id) ? 100 : 0;
            return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/math/${topic.id}`}>
                <motion.div
                  className={`bg-gradient-to-br ${topic.color} rounded-3xl p-8 shadow-xl cursor-pointer border-4 border-white/50`}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`topic-${topic.id}`}
                >
                  <div className="text-6xl mb-4 text-center">{topic.icon}</div>
                  <h3 className="text-2xl font-black text-white text-center mb-4">{topic.title}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-white/90">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-white/30" />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white font-bold px-4 py-2 rounded-full text-sm">
                      {progress === 100 ? 'Review' : 'Start Learning'}
                    </span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
