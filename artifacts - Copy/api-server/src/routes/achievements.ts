import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, achievementsTable, userAchievementsTable } from "@workspace/db";
import { requireSelfOrRole } from "../middlewares/auth";
import {
  ListAchievementsResponse,
  GetUserAchievementsParams,
  GetUserAchievementsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/achievements", async (req, res): Promise<void> => {
  const rows = await db.select().from(achievementsTable);
  res.json(ListAchievementsResponse.parse(rows));
});

router.get("/achievements/:userId", requireSelfOrRole("userId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const rows = await db.select({
    achievementId: userAchievementsTable.achievementId,
    unlockedAt: userAchievementsTable.unlockedAt,
    id: achievementsTable.id,
    title: achievementsTable.title,
    description: achievementsTable.description,
    icon: achievementsTable.icon,
    category: achievementsTable.category,
    xpReward: achievementsTable.xpReward,
    coinsReward: achievementsTable.coinsReward,
  }).from(userAchievementsTable)
    .innerJoin(achievementsTable, eq(userAchievementsTable.achievementId, achievementsTable.id))
    .where(eq(userAchievementsTable.userId, userId));
  const mapped = rows.map(r => ({
    achievement: {
      id: r.id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      category: r.category,
      xpReward: r.xpReward,
      coinsReward: r.coinsReward,
    },
    unlockedAt: r.unlockedAt.toISOString(),
  }));
  res.json(GetUserAchievementsResponse.parse(mapped));
});

export default router;
