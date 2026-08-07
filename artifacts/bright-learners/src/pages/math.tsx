import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useListCompletedLessons } from '@workspace/api-client-react';
import { mathLessons } from '@/data/lessonContent';

// Visual styling per topic id. Any lesson id not listed here falls back to a
// default icon/color further down, so new lessons never crash the page.
const topicMeta: Record<string, { icon: string; color: string }> = {
  'counting-to-100': { icon: '🔢', color: 'from-red-400 to-orange-500' },
  'counting-in-steps': { icon: '🐾', color: 'from-orange-400 to-amber-500' },
  'place-value': { icon: '🔟', color: 'from-amber-400 to-yellow-500' },
  'number-bonds': { icon: '🧩', color: 'from-yellow-400 to-lime-500' },
  counting: { icon: '🔢', color: 'from-red-400 to-orange-500' },
  addition: { icon: '➕', color: 'from-orange-400 to-yellow-500' },
  subtraction: { icon: '➖', color: 'from-yellow-400 to-green-500' },
  fractions: { icon: '½', color: 'from-cyan-400 to-blue-500' },
  'money-coins': { icon: '🪙', color: 'from-lime-400 to-green-500' },
  'time-oclock': { icon: '🕐', color: 'from-green-400 to-teal-500' },
  '2d-shapes': { icon: '🔷', color: 'from-teal-400 to-cyan-500' },
  '3d-shapes': { icon: '🧊', color: 'from-cyan-400 to-sky-500' },
  'position-direction': { icon: '🧭', color: 'from-sky-400 to-blue-500' },
  'length-height': { icon: '📏', color: 'from-blue-400 to-indigo-500' },
  'mass-capacity': { icon: '⚖️', color: 'from-indigo-400 to-violet-500' },
  'sequencing-events': { icon: '📅', color: 'from-violet-400 to-purple-500' },
  'addition-subtraction-problems': { icon: '📝', color: 'from-purple-400 to-pink-500' },
  multiplication: { icon: '✖️', color: 'from-green-400 to-teal-500' },
  division: { icon: '➗', color: 'from-teal-400 to-cyan-500' },
  money: { icon: '💰', color: 'from-blue-400 to-indigo-500' },
  time: { icon: '⏰', color: 'from-indigo-400 to-purple-500' },
  shapes: { icon: '🔶', color: 'from-purple-400 to-pink-500' },
  'word-problems': { icon: '📖', color: 'from-rose-400 to-red-500' },
  measurements: { icon: '📐', color: 'from-pink-400 to-rose-500' },
  'place-value-100': { icon: '💯', color: 'from-red-400 to-orange-500' },
  'standard-units': { icon: '📏', color: 'from-orange-400 to-amber-500' },
  'fractions-y2': { icon: '🍕', color: 'from-cyan-400 to-blue-500' },
  statistics: { icon: '📊', color: 'from-lime-400 to-green-500' },
  'shape-properties': { icon: '🔺', color: 'from-purple-400 to-fuchsia-500' },
  'position-turns': { icon: '🧭', color: 'from-sky-400 to-blue-500' },
  'place-value-1000': { icon: '💯', color: 'from-red-400 to-orange-500' },
  'times-tables-3-4-8': { icon: '✖️', color: 'from-orange-400 to-amber-500' },
  'fractions-y3': { icon: '🍕', color: 'from-cyan-400 to-blue-500' },
  'times-tables-to-12': { icon: '✖️', color: 'from-green-400 to-teal-500' },
  'decimals-y4': { icon: '🔢', color: 'from-teal-400 to-cyan-500' },
  'area-perimeter-y4': { icon: '📐', color: 'from-blue-400 to-indigo-500' },
  'primes-squares-cubes': { icon: '🔷', color: 'from-indigo-400 to-violet-500' },
  'fractions-y5': { icon: '🍕', color: 'from-violet-400 to-purple-500' },
  'percentages-y5': { icon: '💯', color: 'from-purple-400 to-fuchsia-500' },
  'order-of-operations-y6': { icon: '🧮', color: 'from-fuchsia-400 to-pink-500' },
  'ratio-proportion-y6': { icon: '⚖️', color: 'from-pink-400 to-rose-500' },
  'algebra-y6': { icon: '🔤', color: 'from-rose-400 to-red-500' },
};

const DEFAULT_META = { icon: '📘', color: 'from-slate-400 to-slate-500' };
const YEARS = [1, 2, 3, 4, 5, 6];

const allMathTopics = Object.entries(mathLessons).map(([id, lesson]) => ({
  id,
  title: lesson.title,
  year: lesson.year,
  strand: lesson.strand,
  ...(topicMeta[id] ?? DEFAULT_META),
}));

export default function Math() {
  const { user } = useAuth();
  const { data: completedLessons } = useListCompletedLessons(
    user?.id || 0,
    { subject: 'math' },
    { query: { enabled: !!user?.id } },
  );
  const completedTopicIds = new Set((completedLessons ?? []).map((l) => l.lessonId));

  const yearsWithContent = useMemo(
    () => new Set(allMathTopics.map((t) => t.year)),
    [],
  );
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const mathTopics = useMemo(
    () => allMathTopics.filter((t) => t.year === selectedYear),
    [selectedYear],
  );

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

      {/* Year Group Selector */}
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
                    ? 'bg-white text-orange-600 border-white shadow-lg'
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

      {/* Topics Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {mathTopics.length === 0 ? (
          <div className="text-center bg-white/90 dark:bg-card/90 rounded-3xl p-12 shadow-xl">
            <p className="text-2xl font-black text-foreground mb-2">Year {selectedYear} Maths is coming soon!</p>
            <p className="text-muted-foreground font-bold">We're still building these lessons. Check back soon.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
