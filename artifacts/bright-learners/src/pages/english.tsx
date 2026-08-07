import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useListCompletedLessons } from '@workspace/api-client-react';
import { englishStories, readingPassages, comprehensionPassages, englishQuizzes } from '@/data/lessonContent';

const YEARS = [1, 2, 3, 4, 5, 6];

// Passage-backed topics: each links to a fixed category, but the set of
// lessons behind it depends on which year group is selected.
const passageTopicDefs = [
  { id: 'reading', title: 'Reading', icon: '📖', color: 'from-blue-400 to-cyan-500', passages: readingPassages },
  { id: 'comprehension', title: 'Comprehension', icon: '🧠', color: 'from-cyan-400 to-teal-500', passages: comprehensionPassages },
  { id: 'stories', title: 'Stories', icon: '📜', color: 'from-indigo-400 to-purple-500', passages: englishStories },
];

// Quiz-backed topics: each quiz is written for a single year group.
const quizTopicMeta: Record<string, { title: string; icon: string; color: string }> = {
  vocabulary: { title: 'Vocabulary', icon: '📚', color: 'from-teal-400 to-green-500' },
  grammar: { title: 'Grammar', icon: '✍️', color: 'from-green-400 to-emerald-500' },
  'sentence-building': { title: 'Sentence Building', icon: '🔤', color: 'from-emerald-400 to-blue-500' },
  'rhyming-words': { title: 'Rhyming Words', icon: '🎵', color: 'from-pink-400 to-rose-500' },
  'capital-letters-punctuation': { title: 'Capital Letters & Full Stops', icon: '🔠', color: 'from-orange-400 to-red-500' },
  homophones: { title: 'Homophones', icon: '👂', color: 'from-violet-400 to-purple-500' },
  'apostrophes-joining-words': { title: 'Apostrophes & Joining Words', icon: '✏️', color: 'from-fuchsia-400 to-pink-500' },
  'prefixes-suffixes': { title: 'Prefixes and Suffixes', icon: '🧩', color: 'from-amber-400 to-orange-500' },
  'word-classes-apostrophes-y4': { title: 'Word Classes & Standard English', icon: '📝', color: 'from-lime-400 to-green-500' },
  'relative-clauses-cohesion-y5': { title: 'Relative Clauses & Cohesion', icon: '🔗', color: 'from-sky-400 to-cyan-500' },
  'active-passive-punctuation-y6': { title: 'Active/Passive Voice & Punctuation', icon: '⚡', color: 'from-red-400 to-rose-500' },
};

export default function English() {
  const { user } = useAuth();
  const { data: completedLessons } = useListCompletedLessons(
    user?.id || 0,
    { subject: 'english' },
    { query: { enabled: !!user?.id } },
  );
  const completedIds = new Set((completedLessons ?? []).map((l) => l.lessonId));

  const [selectedYear, setSelectedYear] = useState<number>(1);

  const englishTopics = useMemo(() => {
    const passageTopics = passageTopicDefs
      .map((def) => ({
        id: def.id,
        title: def.title,
        icon: def.icon,
        color: def.color,
        lessonIds: def.passages.filter((p) => p.year === selectedYear).map((p) => p.id),
      }))
      .filter((t) => t.lessonIds.length > 0);

    const quizTopics = Object.entries(englishQuizzes)
      .filter(([, quiz]) => quiz.year === selectedYear)
      .map(([id, quiz]) => ({
        id,
        title: quiz.title,
        icon: quizTopicMeta[id]?.icon ?? '📘',
        color: quizTopicMeta[id]?.color ?? 'from-slate-400 to-slate-500',
        lessonIds: [id],
      }));

    return [...passageTopics, ...quizTopics];
  }, [selectedYear]);

  const yearsWithContent = useMemo(() => {
    const years = new Set<number>();
    passageTopicDefs.forEach((def) => def.passages.forEach((p) => years.add(p.year)));
    Object.values(englishQuizzes).forEach((quiz) => years.add(quiz.year));
    return years;
  }, []);

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
                    ? 'bg-white text-blue-600 border-white shadow-lg'
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
        {englishTopics.length === 0 ? (
          <div className="text-center bg-white/90 dark:bg-card/90 rounded-3xl p-12 shadow-xl">
            <p className="text-2xl font-black text-foreground mb-2">Year {selectedYear} English is coming soon!</p>
            <p className="text-muted-foreground font-bold">We're still building these lessons. Check back soon.</p>
          </div>
        ) : (
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
                <Link href={`/english/${topic.id}?year=${selectedYear}`}>
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
        )}
      </div>
    </div>
  );
}
