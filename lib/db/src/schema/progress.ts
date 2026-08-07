import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProgressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalLessonsCompleted: integer("total_lessons_completed").notNull().default(0),
  totalTimeMinutes: integer("total_time_minutes").notNull().default(0),
  overallAccuracy: real("overall_accuracy").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  stars: integer("stars").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonProgressTable = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject", { enum: ["math", "english", "phonics"] }).notNull(),
  lessonId: text("lesson_id").notNull(),
  lessonTitle: text("lesson_title").notNull(),
  score: integer("score").notNull().default(0),
  accuracy: real("accuracy").notNull().default(0),
  timeSpentMinutes: integer("time_spent_minutes").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgressTable).omit({ id: true });
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgressRow = typeof userProgressTable.$inferSelect;

export const insertLessonProgressSchema = createInsertSchema(lessonProgressTable).omit({ id: true, completedAt: true });
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgressRow = typeof lessonProgressTable.$inferSelect;
