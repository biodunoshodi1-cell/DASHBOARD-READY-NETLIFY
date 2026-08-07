import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, gameScoresTable, usersTable } from "@workspace/db";
import { requireSelfOrRole, requireSelfOrRoleInBody } from "../middlewares/auth";
import {
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  SubmitScoreBody,
  SubmitScoreResponse,
  GetUserScoresParams,
  GetUserScoresResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/games/leaderboard", async (req, res): Promise<void> => {
  const qParsed = GetLeaderboardQueryParams.safeParse(req.query);
  if (!qParsed.success) { res.status(400).json({ error: qParsed.error.message }); return; }
  const { game, limit = 10 } = qParsed.data;
  const rows = await db.select({
    id: gameScoresTable.id,
    userId: gameScoresTable.userId,
    score: gameScoresTable.score,
    coinsEarned: gameScoresTable.coinsEarned,
    starsEarned: gameScoresTable.starsEarned,
    playedAt: gameScoresTable.playedAt,
    displayName: usersTable.displayName,
    avatarUrl: usersTable.avatarUrl,
  }).from(gameScoresTable)
    .innerJoin(usersTable, eq(gameScoresTable.userId, usersTable.id))
    .where(eq(gameScoresTable.game, game))
    .orderBy(desc(gameScoresTable.score))
    .limit(limit);
  const mapped = rows.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    displayName: r.displayName,
    avatarUrl: r.avatarUrl ?? null,
    score: r.score,
    playedAt: r.playedAt.toISOString(),
  }));
  res.json(GetLeaderboardResponse.parse(mapped));
});

router.post("/games/scores", requireSelfOrRoleInBody(["teacher", "admin"]), async (req, res): Promise<void> => {
  const parsed = SubmitScoreBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [record] = await db.insert(gameScoresTable).values(parsed.data).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, record.userId));
  res.status(201).json(SubmitScoreResponse.parse({
    ...record,
    displayName: user?.displayName ?? "Player",
    playedAt: record.playedAt.toISOString(),
  }));
});

router.get("/games/scores/:userId", requireSelfOrRole("userId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const rows = await db.select().from(gameScoresTable)
    .where(eq(gameScoresTable.userId, userId))
    .orderBy(desc(gameScoresTable.playedAt))
    .limit(50);
  const mapped = rows.map(r => ({
    ...r,
    displayName: user?.displayName ?? "Player",
    playedAt: r.playedAt.toISOString(),
  }));
  res.json(GetUserScoresResponse.parse(mapped));
});

export default router;
