import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useListCompletedLessons, getListCompletedLessonsQueryKey } from '@workspace/api-client-react';
import { psheLessons } from '@/data/psheContent';

const topicMeta: Record<string, { icon: string; color: string }> = {
  'feelings-emotions': { icon: '😊', color: 'from-yellow-400 to-amber-500' },
  'keeping-healthy': { icon: '🍎', color: 'from-green-400 to-lime-500' },
  'keeping-safe': { icon: '🛡️', color: 'from-red-400 to-orange-500' },
  'friendship-kindness': { icon: '🤝', color: 'from-pink-400 to-rose-500' },
  'rules-rights': { icon: '⚖️', color: 'from-indigo-400 to-blue-500' },
  'looking-after-world': { icon: '🌍', color: 'from-teal-400 to-emerald-500' },
  'managing-feelings-y2': { icon: '😊', color: 'from-yellow-400 to-amber-500' },
  'healthy-lifestyles-y2': { icon: '🏃', color: 'from-green-400 to-lime-500' },
  'safety-online-y2': { icon: '🔒', color: 'from-blue-400 to-indigo-500' },
  'respecting-differences-y2': { icon: '🤝', color: 'from-pink-400 to-rose-500' },
  'money-y2': { icon: '💰', color: 'from-amber-400 to-yellow-500' },
  'community-helpers-y2': { icon: '🚒', color: 'from-red-400 to-orange-500' },
  'growing-and-changing-y3': { icon: '🌱', color: 'from-lime-400 to-green-500' },
  'managing-risk-y3': { icon: '⚠️', color: 'from-amber-400 to-orange-500' },
  'rights-responsibilities-y3': { icon: '⚖️', color: 'from-indigo-400 to-purple-500' },
  'money-decisions-y3': { icon: '💷', color: 'from-yellow-400 to-amber-500' },
  'digital-wellbeing-y3': { icon: '📱', color: 'from-blue-400 to-cyan-500' },
};

const DEFAULT_META = { icon: '🔬', color: 'from-slate-400 to-slate-500' };
const YEARS = [1, 2, 3, 4, 5, 6];

const allTopics = Object.entries(psheLessons).map(([id, lesson]) => ({
  id,
  title: lesson.title,
  year: lesson.year,
  strand: lesson.strand,
  ...(topicMeta[id] ?? DEFAULT_META),
}));

export default function Pshe() {
  const { user } = useAuth();
  const { data: completedLessons } = useListCompletedLessons(
    user?.id || 0,
    { subject: 'pshe' },
    { query: { queryKey: getListCompletedLessonsQueryKey(user?.id || 0, { subject: 'pshe' }), enabled: !!user?.id } },
  );
  const completedTopicIds = new Set((completedLessons ?? []).map((l) => l.lessonId));

  const yearsWithContent = useMemo(() => new Set(allTopics.map((t) => t.year)), []);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const topics = useMemo(() => allTopics.filter((t) => t.year === selectedYear), [selectedYear]);

  return (
    <div className="min-h-[100dvh] gradient-pshe pb-12">
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
              <HeartHandshake className="w-10 h-10 sm:w-16 sm:h-16 text-violet-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg truncate">PSHE</h1>
              <p className="text-sm sm:text-lg md:text-xl font-bold text-white/95 drop-shadow truncate">Health, Relationships & the World</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex flex-wrap gap-3 justify-center" role="tablist" aria-label="Select year group">
          {YEARS.map((year) => {
            const hasContent = yearsWithContent.has(year);
            const isSelected = selectedYear === year;
            return (
              <button
                key={year}
                role="tab"
                aria-selected={isSelected}
                data-testid={`tab-year-${year}`}
                onClick={() => setSelectedYear(year)}
                className={`px-5 py-2 rounded-full font-black text-sm border-2 transition-colors ${
                  isSelected
                    ? 'bg-white text-violet-600 border-white shadow-lg'
                    : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                } ${!hasContent ? 'opacity-60' : ''}`}
              >
                Year {year}
                {!hasContent && <span className="ml-1 text-xs font-bold">(soon)</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {topics.length === 0 ? (
          <div className="text-center bg-white/90 dark:bg-card/90 rounded-3xl p-12 shadow-xl">
            <p className="text-2xl font-black text-foreground mb-2">Year {selectedYear} PSHE is coming soon!</p>
            <p className="text-muted-foreground font-bold">We're still building these lessons. Check back soon.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const isCompleted = completedTopicIds.has(topic.id);
            const progress = isCompleted ? 100 : 0;
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/pshe/${topic.id}`}>
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
                        {progress === 100 ? 'Review' : 'Start Learning'}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
