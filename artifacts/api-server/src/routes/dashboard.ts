import { Router, type IRouter } from "express";
import { eq, and, desc, inArray } from "drizzle-orm";
import { db, usersTable, userProgressTable, lessonProgressTable, gameScoresTable, dailyChallengeCompletionsTable } from "@workspace/db";
import {
  GetStudentDashboardParams,
  GetStudentDashboardResponse,
  GetParentDashboardParams,
  GetParentDashboardResponse,
  GetTeacherDashboardParams,
  GetTeacherDashboardResponse,
  GetAdminDashboardResponse,
} from "@workspace/api-zod";
import { getTodayDateString } from "../lib/questions";
import { requireSelfOrRole, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

// Counts of distinct completable lessons per subject — see the matching
// comment in routes/progress.ts. Keep both in sync with lessonContent.ts.
const TOTAL_LESSONS_BY_SUBJECT: Record<string, number> = { math: 11, english: 12, phonics: 3 };

router.get("/dashboard/student/:userId", requireSelfOrRole("userId", ["teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  let [progress] = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
  if (!progress) {
    const [created] = await db.insert(userProgressTable).values({ userId }).returning();
    progress = created;
  }
  const recentLessons = await db.select().from(lessonProgressTable)
    .where(eq(lessonProgressTable.userId, userId))
    .orderBy(desc(lessonProgressTable.completedAt)).limit(5);
  const today = getTodayDateString();
  const [dailyStatus] = await db.select().from(dailyChallengeCompletionsTable)
    .where(and(eq(dailyChallengeCompletionsTable.userId, userId), eq(dailyChallengeCompletionsTable.date, today)));
  const subjects = ["math", "english", "phonics"] as const;
  const subjectBreakdown = await Promise.all(subjects.map(async (subject) => {
    const rows = await db.select().from(lessonProgressTable)
      .where(and(eq(lessonProgressTable.userId, userId), eq(lessonProgressTable.subject, subject)));
    return {
      subject, lessonsCompleted: rows.length, totalLessons: TOTAL_LESSONS_BY_SUBJECT[subject],
      accuracy: rows.length > 0 ? rows.reduce((s, r) => s + r.accuracy, 0) / rows.length : 0,
      timeMinutes: rows.reduce((s, r) => s + r.timeSpentMinutes, 0),
    };
  }));
  const { passwordHash: _, firebaseUid: __, ...safeUser } = user;
  res.json(GetStudentDashboardResponse.parse({
    user: safeUser,
    rewards: { userId: progress.userId, stars: progress.stars, coins: progress.coins, xp: progress.xp, level: progress.level, xpToNextLevel: Math.max(0, progress.level * 100 - progress.xp), unlockedAvatars: ["owl"], activeAvatar: "owl" },
    recentProgress: recentLessons,
    subjectBreakdown,
    recentAchievements: [],
    dailyChallengeCompleted: !!dailyStatus,
    weeklyStreak: progress.currentStreak,
  }));
});

router.get("/dashboard/parent/:userId", requireSelfOrRole("userId", ["teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const children = await db.select().from(usersTable).where(eq(usersTable.parentId, userId));
  const childSummaries = await Promise.all(children.map(async (child) => {
    const { passwordHash: _, firebaseUid: __, ...safeChild } = child;
    let [progress] = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, child.id));
    if (!progress) { const [c] = await db.insert(userProgressTable).values({ userId: child.id }).returning(); progress = c; }
    const recentLessons = await db.select().from(lessonProgressTable).where(eq(lessonProgressTable.userId, child.id)).orderBy(desc(lessonProgressTable.completedAt)).limit(3);
    const subjects = ["math", "english", "phonics"] as const;
    const subjectBreakdown = await Promise.all(subjects.map(async (subject) => {
      const rows = await db.select().from(lessonProgressTable).where(and(eq(lessonProgressTable.userId, child.id), eq(lessonProgressTable.subject, subject)));
      return { subject, lessonsCompleted: rows.length, totalLessons: TOTAL_LESSONS_BY_SUBJECT[subject], accuracy: rows.length > 0 ? rows.reduce((s, r) => s + r.accuracy, 0) / rows.length : 0, timeMinutes: rows.reduce((s, r) => s + r.timeSpentMinutes, 0) };
    }));
    return { user: safeChild, progress: { ...progress }, recentLessons, subjectBreakdown };
  }));

  // Weekly activity (last 7 days), combined across all of this parent's children,
  // computed from their real lesson completions rather than hardcoded zeros.
  const childIds = children.map((c) => c.id);
  const allChildLessons = childIds.length > 0
    ? await db.select().from(lessonProgressTable).where(inArray(lessonProgressTable.userId, childIds))
    : [];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    const dayStart = new Date(ds + "T00:00:00Z");
    const dayEnd = new Date(ds + "T23:59:59Z");
    const dayRows = allChildLessons.filter((r) => {
      const completed = new Date(r.completedAt);
      return completed >= dayStart && completed <= dayEnd;
    });
    days.push({
      date: ds,
      lessonsCompleted: dayRows.length,
      timeMinutes: dayRows.reduce((s, r) => s + r.timeSpentMinutes, 0),
      accuracy: dayRows.length > 0 ? dayRows.reduce((s, r) => s + r.accuracy, 0) / dayRows.length : 0,
    });
  }
  res.json(GetParentDashboardResponse.parse({ children: childSummaries, weeklyActivity: days }));
});

router.get("/dashboard/teacher/:userId", requireSelfOrRole("userId", ["admin"]), async (req, res): Promise<void> => {
  const students = await db.select().from(usersTable).where(eq(usersTable.role, "student"));
  const allProgress = await db.select().from(userProgressTable);
  const totalStudents = students.length;
  const avgAcc = allProgress.length > 0 ? allProgress.reduce((s, p) => s + p.overallAccuracy, 0) / allProgress.length : 0;
  // Active today (simplified: students with lessons today)
  const today = getTodayDateString();
  const todayStart = new Date(today + "T00:00:00Z");
  const allLessons = await db.select().from(lessonProgressTable);
  const activeToday = new Set(allLessons.filter(l => new Date(l.completedAt) >= todayStart).map(l => l.userId)).size;
  const studentsWithProgress = students.slice(0, 5).map(s => {
    const { passwordHash: _, firebaseUid: __, ...safeS } = s;
    const p = allProgress.find(p => p.userId === s.id);
    return { user: safeS, accuracy: p?.overallAccuracy ?? 0, lessonsCompleted: p?.totalLessonsCompleted ?? 0, lastActive: s.createdAt.toISOString() };
  });

  // Real per-subject stats across all students, computed from actual lesson
  // completions rather than random placeholder numbers.
  const subjects = ["math", "english", "phonics"] as const;
  const subjectStats = await Promise.all(subjects.map(async (subject) => {
    const rows = await db.select().from(lessonProgressTable).where(eq(lessonProgressTable.subject, subject));
    return {
      subject,
      avgAccuracy: rows.length > 0 ? rows.reduce((s, r) => s + r.accuracy, 0) / rows.length : 0,
      totalLessonsCompleted: rows.length,
    };
  }));

  res.json(GetTeacherDashboardResponse.parse({
    totalStudents, avgAccuracy: avgAcc, activeToday,
    topPerformers: studentsWithProgress.slice(0, 3),
    studentsNeedingHelp: studentsWithProgress.slice(3),
    subjectStats,
  }));
});

router.get("/dashboard/admin", requireRole("admin"), async (req, res): Promise<void> => {
  const allUsers = await db.select().from(usersTable);
  const students = allUsers.filter(u => u.role === "student").length;
  const teachers = allUsers.filter(u => u.role === "teacher").length;
  const parents = allUsers.filter(u => u.role === "parent").length;
  const allProgress = await db.select().from(userProgressTable);
  const totalLessons = allProgress.reduce((s, p) => s + p.totalLessonsCompleted, 0);
  const avgAcc = allProgress.length > 0 ? allProgress.reduce((s, p) => s + p.overallAccuracy, 0) / allProgress.length : 0;
  const today = getTodayDateString();
  const todayStart = new Date(today + "T00:00:00Z");
  const allLessons = await db.select().from(lessonProgressTable);
  const activeToday = new Set(allLessons.filter(l => new Date(l.completedAt) >= todayStart).map(l => l.userId)).size;
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const recentReg = allUsers.filter(u => new Date(u.createdAt) >= weekAgo).length;

  // Real top-games ranking from actual score submissions, rather than random
  // placeholder numbers for a fixed 3-game list.
  const allGameScores = await db.select().from(gameScoresTable);
  const gameTotals = new Map<string, { timesPlayed: number; scoreSum: number }>();
  for (const row of allGameScores) {
    const entry = gameTotals.get(row.game) ?? { timesPlayed: 0, scoreSum: 0 };
    entry.timesPlayed += 1;
    entry.scoreSum += row.score;
    gameTotals.set(row.game, entry);
  }
  const topGames = Array.from(gameTotals.entries())
    .map(([game, { timesPlayed, scoreSum }]) => ({
      game,
      timesPlayed,
      avgScore: Math.round(scoreSum / timesPlayed),
    }))
    .sort((a, b) => b.timesPlayed - a.timesPlayed)
    .slice(0, 3);

  res.json(GetAdminDashboardResponse.parse({
    totalStudents: students, totalTeachers: teachers, totalParents: parents,
    activeToday, totalLessonsCompleted: totalLessons, avgAccuracy: avgAcc,
    topGames, registrationsThisWeek: recentReg,
  }));
});

export default router;
