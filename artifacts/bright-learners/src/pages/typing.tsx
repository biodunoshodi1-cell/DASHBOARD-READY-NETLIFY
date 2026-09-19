import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Keyboard, CheckCircle2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  useListCompletedLessons,
  getListCompletedLessonsQueryKey,
  useListTypingAssignments,
  getListTypingAssignmentsQueryKey,
} from '@workspace/api-client-react';
import { typingLevels } from '@/data/typingContent';

export default function Typing() {
  const { user } = useAuth();
  const { data: completedLessons } = useListCompletedLessons(
    user?.id || 0,
    { subject: 'typing' },
    { query: { queryKey: getListCompletedLessonsQueryKey(user?.id || 0, { subject: 'typing' }), enabled: !!user?.id } },
  );
  const { data: assignments } = useListTypingAssignments(user?.id || 0, {
    query: { queryKey: getListTypingAssignmentsQueryKey(user?.id || 0), enabled: !!user?.id },
  });
  const completedIds = new Set((completedLessons ?? []).map((l) => l.lessonId));
  const assignedIds = new Set((assignments ?? []).filter((a) => !a.completed).map((a) => `${a.levelId}-${a.moduleId}`));

  const [selectedLevel, setSelectedLevel] = useState(typingLevels[0].id);
  const activeLevel = useMemo(() => typingLevels.find((l) => l.id === selectedLevel) ?? typingLevels[0], [selectedLevel]);

  const completedInLevel = (levelId: string) =>
    (typingLevels.find((l) => l.id === levelId)?.modules ?? []).filter((m) => completedIds.has(`${levelId}-${m.id}`)).length;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
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
              <Keyboard className="w-10 h-10 sm:w-16 sm:h-16 text-sky-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground truncate">Typing</h1>
              <p className="text-sm sm:text-lg md:text-xl font-bold text-muted-foreground truncate">Touch-Type, Read & Spell</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Level selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-8" role="tablist" aria-label="Select level">
          {typingLevels.map((level) => {
            const isSelected = selectedLevel === level.id;
            const done = completedInLevel(level.id);
            return (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center gap-2 ${
                  isSelected
                    ? `bg-gradient-to-br ${level.color} text-white shadow-lg scale-105`
                    : 'bg-white dark:bg-card text-foreground hover:scale-105'
                }`}
                data-testid={`level-tab-${level.id}`}
              >
                <span className="text-xl">{level.icon}</span>
                {level.title}
                <span className="text-xs font-bold opacity-80">
                  {done}/{level.modules.length}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={activeLevel.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 dark:bg-card/90 rounded-3xl p-6 sm:p-8 border-4 border-white/50 mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{activeLevel.icon}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">{activeLevel.title}</h2>
            <span className="text-sm font-bold text-muted-foreground ml-1">{activeLevel.yearGroup}</span>
          </div>
          <p className="text-muted-foreground font-semibold">{activeLevel.description}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
          {activeLevel.modules.map((module) => {
            const lessonId = `${activeLevel.id}-${module.id}`;
            const isDone = completedIds.has(lessonId);
            const isAssigned = assignedIds.has(lessonId);
            return (
              <Link key={module.id} href={`/typing/${activeLevel.id}/${module.id}`}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative bg-gradient-to-br ${activeLevel.color} rounded-3xl p-6 text-white shadow-lg cursor-pointer h-full`}
                  data-testid={`module-card-${lessonId}`}
                >
                  {isDone && <CheckCircle2 className="absolute top-4 right-4 w-7 h-7 text-white drop-shadow" />}
                  {isAssigned && !isDone && (
                    <span className="absolute top-4 right-4 flex items-center gap-1 bg-white/25 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-black">
                      <ClipboardList className="w-3 h-3" /> Assigned
                    </span>
                  )}
                  <h3 className="text-xl font-black mb-1">{module.title}</h3>
                  <p className="text-sm font-semibold text-white/90 mb-3">{module.pattern}</p>
                  {module.newKeys.length > 0 && (
                    <p className="text-xs font-bold text-white/80">
                      New keys: {module.newKeys.join(' ').toUpperCase()}
                    </p>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
