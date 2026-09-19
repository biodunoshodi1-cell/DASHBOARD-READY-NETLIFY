import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gameScoresTable = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  game: text("game").notNull(),
  score: integer("score").notNull().default(0),
  coinsEarned: integer("coins_earned").notNull().default(0),
  starsEarned: integer("stars_earned").notNull().default(0),
  playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGameScoreSchema = createInsertSchema(gameScoresTable).omit({ id: true, playedAt: true });
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScoresTable.$inferSelect;
