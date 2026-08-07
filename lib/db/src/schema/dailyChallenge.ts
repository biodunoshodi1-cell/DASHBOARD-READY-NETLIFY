import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyChallengesTable = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull().unique(),
  questionsJson: text("questions_json").notNull(), // stored as JSON string
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dailyChallengeCompletionsTable = pgTable("daily_challenge_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  totalCorrect: integer("total_correct").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(15),
  earnedBadge: boolean("earned_badge").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallengesTable).omit({ id: true, createdAt: true });
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type DailyChallenge = typeof dailyChallengesTable.$inferSelect;

export const insertDailyChallengeCompletionSchema = createInsertSchema(dailyChallengeCompletionsTable).omit({ id: true, completedAt: true });
export type InsertDailyChallengeCompletion = z.infer<typeof insertDailyChallengeCompletionSchema>;
export type DailyChallengeCompletion = typeof dailyChallengeCompletionsTable.$inferSelect;
