import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, userProgressTable } from "@workspace/db";
import { requireSelfOrRole, requireSelfOrRoleInBody } from "../middlewares/auth";
import {
  GetUserRewardsParams,
  GetUserRewardsResponse,
  AwardRewardsBody,
  AwardRewardsResponse,
} from "@workspace/api-zod";

const ALL_AVATARS = ["owl", "fox", "rabbit", "bear", "penguin", "cat"];

const router: IRouter = Router();

router.get("/rewards/:userId", requireSelfOrRole("userId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  let [progress] = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
  if (!progress) {
    const [created] = await db.insert(userProgressTable).values({ userId }).returning();
    progress = created;
  }
  const xpToNextLevel = (progress.level * 100) - progress.xp;
  // Unlock avatars based on level
  const unlockedCount = Math.min(progress.level, ALL_AVATARS.length);
  const unlockedAvatars = ALL_AVATARS.slice(0, unlockedCount);
  res.json(GetUserRewardsResponse.parse({
    userId: progress.userId,
    stars: progress.stars,
    coins: progress.coins,
    xp: progress.xp,
    level: progress.level,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    unlockedAvatars,
    activeAvatar: unlockedAvatars[0] ?? "owl",
  }));
});

router.post("/rewards/award", requireSelfOrRoleInBody(["teacher", "admin"]), async (req, res): Promise<void> => {
  const parsed = AwardRewardsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { userId, stars = 0, coins = 0, xp = 0 } = parsed.data;
  let [progress] = await db.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
  if (!progress) {
    const [created] = await db.insert(userProgressTable).values({ userId }).returning();
    progress = created;
  }
  const newXp = progress.xp + xp;
  const newLevel = Math.floor(newXp / 100) + 1;
  const [updated] = await db.update(userProgressTable).set({
    stars: progress.stars + stars,
    coins: progress.coins + coins,
    xp: newXp,
    level: newLevel,
  }).where(eq(userProgressTable.userId, userId)).returning();
  const xpToNextLevel = Math.max(0, (updated.level * 100) - updated.xp);
  const unlockedCount = Math.min(updated.level, ALL_AVATARS.length);
  const unlockedAvatars = ALL_AVATARS.slice(0, unlockedCount);
  res.json(AwardRewardsResponse.parse({
    userId: updated.userId,
    stars: updated.stars,
    coins: updated.coins,
    xp: updated.xp,
    level: updated.level,
    xpToNextLevel,
    unlockedAvatars,
    activeAvatar: unlockedAvatars[0] ?? "owl",
  }));
});

export default router;
