import { useState } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, ClipboardCheck, CheckCircle2, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  useAssignTypingModule,
  useListTypingAssignments,
  getListTypingAssignmentsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { typingLevels } from '@/data/typingContent';

export type AssignableStudent = { id: number; displayName: string };

interface AssignTypingModuleCardProps {
  students: AssignableStudent[];
}

export function AssignTypingModuleCard({ students }: AssignTypingModuleCardProps) {
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState<string>(students[0] ? String(students[0].id) : '');
  const [levelId, setLevelId] = useState(typingLevels[0].id);
  const [moduleId, setModuleId] = useState(typingLevels[0].modules[0].id);
  const [confirmedFor, setConfirmedFor] = useState<string | null>(null);
  const assignMutation = useAssignTypingModule();

  const { data: assignments } = useListTypingAssignments(Number(studentId) || 0, {
    query: {
      queryKey: getListTypingAssignmentsQueryKey(Number(studentId) || 0),
      enabled: !!studentId,
    },
  });

  const activeLevel = typingLevels.find((l) => l.id === levelId) ?? typingLevels[0];

  const handleAssign = () => {
    if (!studentId) return;
    assignMutation.mutate(
      { data: { studentId: Number(studentId), levelId, moduleId } },
      {
        onSuccess: () => {
          const student = students.find((s) => String(s.id) === studentId);
          setConfirmedFor(student?.displayName ?? 'student');
          setTimeout(() => setConfirmedFor(null), 3000);
          queryClient.invalidateQueries({ queryKey: getListTypingAssignmentsQueryKey(Number(studentId)) });
        },
      },
    );
  };

  if (students.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border">
      <div className="flex items-center gap-2 mb-6">
        <Keyboard className="w-6 h-6 text-sky-600" />
        <h2 className="text-2xl font-black text-foreground">Assign a Typing Module</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <Label className="text-xs font-black text-muted-foreground uppercase">Student</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger className="rounded-xl mt-1" data-testid="select-assign-student">
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-black text-muted-foreground uppercase">Level</Label>
          <Select
            value={levelId}
            onValueChange={(v) => {
              setLevelId(v);
              const level = typingLevels.find((l) => l.id === v);
              if (level) setModuleId(level.modules[0].id);
            }}
          >
            <SelectTrigger className="rounded-xl mt-1" data-testid="select-assign-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typingLevels.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.icon} {l.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-black text-muted-foreground uppercase">Module</Label>
          <Select value={moduleId} onValueChange={setModuleId}>
            <SelectTrigger className="rounded-xl mt-1" data-testid="select-assign-module">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeLevel.modules.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleAssign}
        disabled={!studentId || assignMutation.isPending}
        className="rounded-2xl font-black bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
        data-testid="button-assign-module"
      >
        <ClipboardCheck className="w-4 h-4 mr-2" />
        {assignMutation.isPending ? 'Assigning…' : 'Assign Module'}
      </Button>

      {confirmedFor && (
        <p className="mt-3 text-sm font-bold text-green-600 dark:text-green-400" data-testid="text-assign-confirmation">
          Assigned to {confirmedFor} 🎉
        </p>
      )}

      {studentId && assignments && assignments.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-border">
          <p className="text-sm font-black text-muted-foreground uppercase mb-3">This student's assignments</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {assignments.map((a) => {
              const level = typingLevels.find((l) => l.id === a.levelId);
              const module = level?.modules.find((m) => m.id === a.moduleId);
              return (
                <div key={a.id} className="flex items-center justify-between bg-muted rounded-xl px-4 py-2 text-sm font-bold">
                  <span>{level?.icon} {module?.title ?? a.moduleId}</span>
                  {a.completed ? (
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> Done</span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-500"><Clock3 className="w-4 h-4" /> Pending</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
