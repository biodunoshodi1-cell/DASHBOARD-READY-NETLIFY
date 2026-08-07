import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Volume2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useListCompletedLessons } from '@workspace/api-client-react';

const phonicsSections = [
  {
    id: 'double-vowels',
    title: 'Double Vowel Sounds',
    description: 'ai, ay, ee, ea, oa, oo, oi, oy, ie, ue',
    icon: '🎵',
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'double-consonants',
    title: 'Double Consonants',
    description: 'll, ss, ff, tt, pp, nn, rr, bb, dd, mm',
    icon: '🎼',
    color: 'from-rose-400 to-orange-500',
  },
  {
    id: 'consonant-digraphs',
    title: 'Consonant Digraphs',
    description: 'ch, sh, th, wh, ph, ck, ng, nk, qu',
    icon: '🎶',
    color: 'from-orange-400 to-yellow-500',
  },
];

export default function Phonics() {
  const { user } = useAuth();
  const { data: completedLessons } = useListCompletedLessons(
    user?.id || 0,
    { subject: 'phonics' },
    { query: { enabled: !!user?.id } },
  );
  const completedIds = new Set((completedLessons ?? []).map((l) => l.lessonId));

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
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-card rounded-3xl p-4 shadow-lg">
              <Volume2 className="w-16 h-16 text-pink-600" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white drop-shadow-lg">Phonics</h1>
              <p className="text-xl font-bold text-white/95 drop-shadow">Sounds & Letters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {phonicsSections.map((section, index) => {
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
    </div>
  );
}
