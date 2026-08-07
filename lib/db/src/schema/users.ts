import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // Set when the account signs in via Firebase Authentication instead of
  // (or in addition to) email/password. Null for password-only accounts.
  firebaseUid: text("firebase_uid").unique(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["student", "parent", "teacher", "admin"] }).notNull().default("student"),
  avatarUrl: text("avatar_url"),
  gradeLevel: integer("grade_level"),
  age: integer("age"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
