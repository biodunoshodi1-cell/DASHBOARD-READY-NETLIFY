import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// A Typing module assigned to a student by a parent or teacher. Completion
// isn't tracked here directly — it's derived by matching (levelId, moduleId)
// against lessonProgressTable rows with subject "typing" and
// lessonId `${levelId}-${moduleId}` (see routes/typing.ts).
export const typingAssignmentsTable = pgTable("typing_assignments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  assignedBy: integer("assigned_by").notNull(),
  levelId: text("level_id").notNull(),
  moduleId: text("module_id").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTypingAssignmentSchema = createInsertSchema(typingAssignmentsTable).omit({ id: true, createdAt: true });
export type InsertTypingAssignment = z.infer<typeof insertTypingAssignmentSchema>;
export type TypingAssignmentRow = typeof typingAssignmentsTable.$inferSelect;
