import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useListCompletedLessons } from '@workspace/api-client-react';
import { englishStories, readingPassages, comprehensionPassages } from '@/data/lessonContent';

const englishTopics = [
  { id: 'reading', title: 'Reading', icon: '📖', color: 'from-blue-400 to-cyan-500', lessonIds: readingPassages.map((p) => p.id) },
  { id: 'comprehension', title: 'Comprehension', icon: '🧠', color: 'from-cyan-400 to-teal-500', lessonIds: comprehensionPassages.map((p) => p.id) },
  { id: 'vocabulary', title: 'Vocabulary', icon: '📚', color: 'from-teal-400 to-green-500', lessonIds: ['vocabulary'] },
  { id: 'grammar', title: 'Grammar', icon: '✍️', color: 'from-green-400 to-emerald-500', lessonIds: ['grammar'] },
  { id: 'sentence-building', title: 'Sentence Building', icon: '🔤', color: 'from-emerald-400 to-blue-500', lessonIds: ['sentence-building'] },
  { id: 'stories', title: 'Stories', icon: '📜', color: 'from-indigo-400 to-purple-500', lessonIds: englishStories.map((p) => p.id) },
];

export default function English() {
  const { user } = useAuth();
  const { data: completedLessons } = useListCompletedLessons(
    user?.id || 0,
    { subject: 'english' },
    { query: { enabled: !!user?.id } },
  );
  const completedIds = new Set((completedLessons ?? []).map((l) => l.lessonId));

  return (
    <div className="min-h-[100dvh] gradient-english pb-12">
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
              <BookText className="w-16 h-16 text-blue-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">English</h1>
              <p className="text-xl font-bold text-white/95 drop-shadow">Reading & Writing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {englishTopics.map((topic, index) => {
            const completedCount = topic.lessonIds.filter((id) => completedIds.has(id)).length;
            const progress = Math.round((completedCount / topic.lessonIds.length) * 100);
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/english/${topic.id}`}>
                  <motion.div
                    className={`bg-gradient-to-br ${topic.color} rounded-3xl p-8 shadow-xl cursor-pointer border-4 border-white/50`}
                    whileHover={{ scale: 1.05, rotate: -2 }}
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
                        {progress === 100 ? 'Review' : progress > 0 ? 'Continue' : 'Start Learning'}
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
