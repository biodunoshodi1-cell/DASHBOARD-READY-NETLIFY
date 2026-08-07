import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, dailyChallengesTable, dailyChallengeCompletionsTable, userProgressTable } from "@workspace/db";
import {
  GetTodayChallengeResponse,
  SubmitDailyChallengeBody,
  SubmitDailyChallengeResponse,
  GetDailyChallengeStatusParams,
  GetDailyChallengeStatusResponse,
} from "@workspace/api-zod";
import { generateDailyChallenge, getTodayDateString } from "../lib/questions";

const router: IRouter = Router();

router.get("/daily-challenge/today", async (req, res): Promise<void> => {
  const today = getTodayDateString();
  let [challenge] = await db.select().from(dailyChallengesTable).where(eq(dailyChallengesTable.date, today));
  if (!challenge) {
    const generated = generateDailyChallenge(today);
    const [created] = await db.insert(dailyChallengesTable)
      .values({ date: today, questionsJson: JSON.stringify(generated) })
      .returning();
    challenge = created;
  }
  const data = JSON.parse(challenge.questionsJson);
  res.json(GetTodayChallengeResponse.parse(data));
});

router.post("/daily-challenge/submit", async (req, res): Promise<void> => {
  const parsed = SubmitDailyChallengeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { userId, date, answers } = parsed.data;
  // Get today's challenge to check answers
  let [challenge] = await db.select().from(dailyChallengesTable).where(eq(dailyChallengesTable.date, date));
  if (!challenge) {
    const generated = generateDailyChallenge(date);
    const [created] = await db.insert(dailyChallengesTable)
      .values({ date, questionsJson: JSON.stringify(generated) })
      .returning();
    challenge = created;
  }
  const challengeData = JSON.parse(challenge.questionsJson);
  const allQuestions = [
    ...challengeData.mathQuestions,
    ...challengeData.englishQuestions,
    ...challengeData.phonicsQuestions,
  ];
  let totalCorrect = 0;
  for (const ans of answers) {
    const q = allQuestions.find((q: any) => q.id === ans.questionId);
    if (q && q.correctAnswer === ans.answer) totalCorrect++;
  }
  const totalQuestions = allQuestions.length;
  const earnedBadge = totalCorrect === totalQuestions;
  // Save completion
  await db.insert(dailyChallengeCompletionsTable)
    .values({ userId, date, totalCorrect, totalQuestions, earnedBadge })
    .onConflictDoNothing();
  // Award coins and stars
  const coinsEarned = totalCorrect * 5;
  const starsEarned = earnedBadge ? 3 : totalCorrect >= 10 ? 2 : 1;
  const xpEarned = totalCorrect * 10;
  // Update user progress
  let [progress] = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
  if (!progress) {
    const [created] = await db.insert(userProgressTable).values({ userId }).returning();
    progress = created;
  }
  await db.update(userProgressTable).set({
    coins: progress.coins + coinsEarned,
    stars: progress.stars + starsEarned,
    xp: progress.xp + xpEarned,
  }).where(eq(userProgressTable.userId, userId));
  res.json(SubmitDailyChallengeResponse.parse({ totalCorrect, totalQuestions, earnedBadge, coinsEarned, starsEarned, xpEarned }));
});

router.get("/daily-challenge/status/:userId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const today = getTodayDateString();
  const [completion] = await db.select().from(dailyChallengeCompletionsTable)
    .where(and(eq(dailyChallengeCompletionsTable.userId, userId), eq(dailyChallengeCompletionsTable.date, today)));
  res.json(GetDailyChallengeStatusResponse.parse({
    userId,
    date: today,
    completed: !!completion,
    score: completion?.totalCorrect ?? null,
    earnedBadge: completion?.earnedBadge ?? false,
  }));
});

export default router;
