import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Volume2, CheckCircle2, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhonicsReferenceBook } from '@/components/PhonicsReferenceBook';
import { useAuth } from '@/contexts/AuthContext';
import { useListCompletedLessons, getListCompletedLessonsQueryKey } from '@workspace/api-client-react';

const YEARS = [1, 2, 3, 4, 5, 6];

const phonicsSections = [
  {
    id: 'double-vowels',
    title: 'Double Vowel Sounds',
    description: 'ai, ay, ee, ea, oa, oo, oi, oy, ie, ue',
    icon: '🎵',
    color: 'from-pink-400 to-rose-500',
    year: 1,
  },
  {
    id: 'double-consonants',
    title: 'Double Consonants',
    description: 'll, ss, ff, tt, pp, nn, rr, bb, dd, mm',
    icon: '🎼',
    color: 'from-rose-400 to-orange-500',
    year: 1,
  },
  {
    id: 'consonant-digraphs',
    title: 'Consonant Digraphs',
    description: 'ch, sh, th, wh, ph, ck, ng, nk, qu',
    icon: '🎶',
    color: 'from-orange-400 to-yellow-500',
    year: 1,
  },
  {
    id: 'split-digraphs',
    title: 'Split Digraphs (Magic E)',
    description: 'a-e, e-e, i-e, o-e, u-e',
    icon: '✨',
    color: 'from-yellow-400 to-amber-500',
    year: 1,
  },
  {
    id: 'r-controlled-vowels',
    title: 'R-Controlled Vowels',
    description: 'ir, ur, er, or, ar, ear, air, are, ore, oar',
    icon: '🚗',
    color: 'from-purple-400 to-indigo-500',
    year: 2,
  },
  {
    id: 'more-vowel-teams',
    title: 'More Vowel Teams',
    description: 'igh, ow, ou, aw, au, ew, oe, ei, ey, y',
    icon: '🎈',
    color: 'from-indigo-400 to-blue-500',
    year: 2,
  },
  {
    id: 'common-suffixes',
    title: 'Common Suffixes',
    description: '-ing, -ed, -er, -est, -ly, -ful, -less, -ness, -y, -es',
    icon: '🧩',
    color: 'from-teal-400 to-cyan-500',
    year: 2,
  },
  {
    id: 'common-prefixes',
    title: 'Common Prefixes',
    description: 'un-, re-, dis-, mis-, non-, pre-',
    icon: '🔤',
    color: 'from-cyan-400 to-sky-500',
    year: 2,
  },
];

export default function Phonics() {
  const { user } = useAuth();
  const { data: completedLessons } = useListCompletedLessons(
    user?.id || 0,
    { subject: 'phonics' },
    { query: { queryKey: getListCompletedLessonsQueryKey(user?.id || 0, { subject: 'phonics' }), enabled: !!user?.id } },
  );
  const completedIds = new Set((completedLessons ?? []).map((l) => l.lessonId));

  const [selectedYear, setSelectedYear] = useState<number>(1);
  const yearsWithContent = useMemo(() => new Set(phonicsSections.map((s) => s.year)), []);
  const visibleSections = useMemo(
    () => phonicsSections.filter((s) => s.year === selectedYear),
    [selectedYear],
  );

  return (
    <div className="min-h-[100dvh] gradient-phonics pb-12">
      {/* Header */}
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
              <Volume2 className="w-10 h-10 sm:w-16 sm:h-16 text-pink-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg truncate">Phonics</h1>
              <p className="text-sm sm:text-lg md:text-xl font-bold text-white/95 drop-shadow truncate">Sounds & Letters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Practice / Reference Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Tabs defaultValue="practice">
          <div className="flex justify-center mb-2">
            <TabsList className="bg-white/20 backdrop-blur-sm p-1.5 h-auto rounded-full border-2 border-white/40">
              <TabsTrigger
                value="practice"
                className="rounded-full px-6 py-2.5 font-black text-sm text-white/90 data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-lg"
                data-testid="tab-practice"
              >
                <Target className="w-4 h-4 mr-2" />
                Practice
              </TabsTrigger>
              <TabsTrigger
                value="reference"
                className="rounded-full px-6 py-2.5 font-black text-sm text-white/90 data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-lg"
                data-testid="tab-reference"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Reference
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="practice" className="mt-0">
            {/* Year Group Selector */}
            <div className="pt-6">
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
                          ? 'bg-white text-pink-600 border-white shadow-lg'
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

            {/* Sections Grid */}
            <div className="py-12">
              {visibleSections.length === 0 ? (
                <div className="text-center bg-white/90 dark:bg-card/90 rounded-3xl p-12 shadow-xl">
                  <p className="text-2xl font-black text-foreground mb-2">Year {selectedYear} Phonics is coming soon!</p>
                  <p className="text-muted-foreground font-bold">We're still building these lessons. Check back soon.</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {visibleSections.map((section, index) => {
                  const isComplete = completedIds.has(section.id);
                  return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/phonics/${section.id}`}>
                      <motion.div
                        className={`relative bg-gradient-to-br ${section.color} rounded-3xl p-10 shadow-2xl cursor-pointer border-4 border-white/50 h-full flex flex-col items-center justify-center text-center`}
                        whileHover={{ scale: 1.08, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid={`section-${section.id}`}
                      >
                        {isComplete && (
                          <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-lg">
                            <CheckCircle2 className="w-7 h-7 text-green-500" />
                          </div>
                        )}
                        <motion.div
                          className="text-8xl mb-6"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          {section.icon}
                        </motion.div>
                        <h3 className="text-3xl font-black text-white mb-3">{section.title}</h3>
                        <p className="text-lg font-bold text-white/90 leading-relaxed">{section.description}</p>
                        <div className="mt-6">
                          <span className="inline-block bg-white/30 backdrop-blur-sm text-white font-black px-6 py-3 rounded-full text-lg">
                            {isComplete ? 'Quiz Passed ✓' : 'Learn Sounds'}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                  );
                })}
              </div>
              )}

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/50 text-center"
              >
                <h3 className="text-2xl font-black text-foreground mb-3">What is Phonics?</h3>
                <p className="text-lg text-muted-foreground font-semibold max-w-3xl mx-auto">
                  Phonics helps you connect letters with sounds! When you know the sounds, you can read any word.
                  Click on a section above to start learning letter sounds and become a reading superstar!
                </p>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="reference" className="mt-0 py-8">
            <PhonicsReferenceBook />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
