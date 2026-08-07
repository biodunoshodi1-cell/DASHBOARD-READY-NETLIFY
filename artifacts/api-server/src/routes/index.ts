import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import progressRouter from "./progress";
import achievementsRouter from "./achievements";
import rewardsRouter from "./rewards";
import gamesRouter from "./games";
import dailyChallengeRouter from "./dailyChallenge";
import dashboardRouter from "./dashboard";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter); // login/register/firebase-session must stay public; /auth/me checks its own session
router.use(requireAuth, usersRouter);
router.use(requireAuth, progressRouter);
router.use(requireAuth, achievementsRouter);
router.use(requireAuth, rewardsRouter);
router.use(requireAuth, gamesRouter);
router.use(requireAuth, dailyChallengeRouter);
router.use(requireAuth, dashboardRouter);

export default router;
