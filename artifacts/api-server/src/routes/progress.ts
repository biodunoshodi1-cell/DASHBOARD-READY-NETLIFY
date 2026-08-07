import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, usersTable, userProgressTable, lessonProgressTable } from "@workspace/db";
import { requireSelfOrRole, requireSelfOrRoleInBody } from "../middlewares/auth";
import {
  GetUserProgressParams,
  GetUserProgressResponse,
  ListCompletedLessonsParams,
  ListCompletedLessonsQueryParams,
  ListCompletedLessonsResponse,
  RecordProgressBody,
  RecordProgressResponse,
  GetWeeklyProgressParams,
  GetWeeklyProgressResponse,
  GetSubjectProgressParams,
  GetSubjectProgressResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/progress/:userId", requireSelfOrRole("userId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  let [progress] = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
  if (!progress) {
    // Auto-create progress record
    const [created] = await db.insert(userProgressTable).values({ userId }).returning();
    progress = created;
  }
  res.json(GetUserProgressResponse.parse({ ...progress }));
});

router.get("/progress/:userId/lessons", requireSelfOrRole("userId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const qParsed = ListCompletedLessonsQueryParams.safeParse(req.query);
  const subject = qParsed.success ? qParsed.data.subject : undefined;
  const filters = [eq(lessonProgressTable.userId, userId)];
  if (subject) filters.push(eq(lessonProgressTable.subject, subject as any));
  const rows = await db.select().from(lessonProgressTable)
    .where(and(...filters))
    .orderBy(desc(lessonProgressTable.completedAt))
    .limit(50);
  res.json(ListCompletedLessonsResponse.parse(rows));
});

router.post("/progress/record", requireSelfOrRoleInBody(["teacher", "admin"]), async (req, res): Promise<void> => {
  const parsed = RecordProgressBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { userId, subject, lessonId, lessonTitle, score, accuracy, timeSpentMinutes } = parsed.data;
  const [record] = await db.insert(lessonProgressTable)
    .values({ userId, subject, lessonId, lessonTitle, score, accuracy, timeSpentMinutes })
    .returning();
  // Update aggregate progress
  let [progress] = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
  if (!progress) {
    const [created] = await db.insert(userProgressTable).values({ userId }).returning();
    progress = created;
  }
  const newTotal = progress.totalLessonsCompleted + 1;
  const newTime = progress.totalTimeMinutes + timeSpentMinutes;
  const newAccuracy = ((progress.overallAccuracy * progress.totalLessonsCompleted) + accuracy) / newTotal;
  const xpGained = Math.floor(score * 0.5) + 10;
  const newXp = progress.xp + xpGained;
  const newLevel = Math.floor(newXp / 100) + 1;
  const newStars = progress.stars + (score >= 80 ? 3 : score >= 60 ? 2 : 1);
  const newCoins = progress.coins + Math.floor(score / 10) + 5;
  await db.update(userProgressTable).set({
    totalLessonsCompleted: newTotal,
    totalTimeMinutes: newTime,
    overallAccuracy: newAccuracy,
    xp: newXp,
    level: newLevel,
    stars: newStars,
    coins: newCoins,
  }).where(eq(userProgressTable.userId, userId));
  res.status(201).json(RecordProgressResponse.parse(record));
});

router.get("/progress/:userId/weekly", requireSelfOrRole("userId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  // Get last 7 days
  const days: Array<{ date: string; lessonsCompleted: number; timeMinutes: number; accuracy: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayStart = new Date(dateStr + "T00:00:00Z");
    const dayEnd = new Date(dateStr + "T23:59:59Z");
    const rows = await db.select().from(lessonProgressTable)
      .where(and(
        eq(lessonProgressTable.userId, userId),
      ));
    const dayRows = rows.filter(r => {
      const d = new Date(r.completedAt);
      return d >= dayStart && d <= dayEnd;
    });
    days.push({
      date: dateStr,
      lessonsCompleted: dayRows.length,
      timeMinutes: dayRows.reduce((s, r) => s + r.timeSpentMinutes, 0),
      accuracy: dayRows.length > 0 ? dayRows.reduce((s, r) => s + r.accuracy, 0) / dayRows.length : 0,
    });
  }
  res.json(GetWeeklyProgressResponse.parse(days));
});

router.get("/progress/:userId/subjects", requireSelfOrRole("userId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const subjects = ["math", "english", "phonics"] as const;
  // Counts of distinct completable lessons per subject, matching the
  // frontend's actual content (artifacts/bright-learners/src/data/lessonContent.ts):
  //   math: 11 topics (counting, addition, subtraction, multiplication, division,
  //     fractions, money, time, shapes, measurements, word-problems)
  //   english: 12 (3 stories + 3 reading + 3 comprehension passages, plus the
  //     vocabulary, grammar, and sentence-building quizzes)
  //   phonics: 3 (one quiz per section: double vowels, double consonants, digraphs —
  //     "Practice Writing" is ungraded repeatable practice and isn't counted here)
  // Keep this in sync if lesson content is added or removed.
  const totalsBySubject: Record<string, number> = { math: 11, english: 12, phonics: 3 };
  const result = await Promise.all(subjects.map(async (subject) => {
    const rows = await db.select().from(lessonProgressTable)
      .where(and(eq(lessonProgressTable.userId, userId), eq(lessonProgressTable.subject, subject)));
    return {
      subject,
      lessonsCompleted: rows.length,
      totalLessons: totalsBySubject[subject],
      accuracy: rows.length > 0 ? rows.reduce((s, r) => s + r.accuracy, 0) / rows.length : 0,
      timeMinutes: rows.reduce((s, r) => s + r.timeSpentMinutes, 0),
    };
  }));
  res.json(GetSubjectProgressResponse.parse(result));
});

export default router;
