import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  // A student/teacher can sign in with either of these — at least one is
  // required (enforced in the /auth/register route, not here) and both are
  // unique when set. Email stayed required in the original Firebase-based
  // flow; it's optional now so young students can log in with just a
  // teacher-issued username and never need an email address.
  username: text("username").unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
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
