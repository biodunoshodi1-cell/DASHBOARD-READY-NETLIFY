import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db, usersTable, userProgressTable } from "@workspace/db";
import {
  LoginBody,
  RegisterBody,
  GetMeResponse,
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/auth/me", async (req, res): Promise<void> => {
  const session = req.session as any;
  if (!session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  safeUser.createdAt = new Date(safeUser.createdAt).toISOString() as never;
  res.json(GetMeResponse.parse(safeUser));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { identifier, password } = parsed.data;
  // identifier may be either a username or an email — try both.
  const [user] = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.username, identifier), eq(usersTable.email, identifier)));
  if (!user) {
    res.status(401).json({ error: "Invalid username/email or password" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid username/email or password" });
    return;
  }
  const session = req.session as any;
  session.userId = user.id;
  const { passwordHash: _, ...safeUser } = user;
  safeUser.createdAt = new Date(safeUser.createdAt).toISOString() as never;
  res.json(LoginResponse.parse(safeUser));
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, email, password, displayName, role, gradeLevel, age } = parsed.data;
  const trimmedUsername = username?.trim() || undefined;
  const trimmedEmail = email?.trim() || undefined;
  if (!trimmedUsername && !trimmedEmail) {
    res.status(400).json({ error: "A username or email is required" });
    return;
  }
  // Check duplicates for whichever identifier(s) were provided.
  const conditions = [
    trimmedUsername ? eq(usersTable.username, trimmedUsername) : undefined,
    trimmedEmail ? eq(usersTable.email, trimmedEmail) : undefined,
  ].filter((c): c is NonNullable<typeof c> => !!c);
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(or(...conditions));
  if (existing) {
    res.status(400).json({
      error:
        trimmedUsername && existing.username === trimmedUsername
          ? "That username is already taken"
          : "Email already registered",
    });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({
      username: trimmedUsername,
      email: trimmedEmail,
      passwordHash,
      displayName,
      role: role ?? "student",
      gradeLevel,
      age,
    })
    .returning();
  // Initialize progress record
  await db.insert(userProgressTable).values({ userId: user.id }).onConflictDoNothing();
  const session = req.session as any;
  session.userId = user.id;
  const { passwordHash: _, ...safeUser } = user;
  safeUser.createdAt = new Date(safeUser.createdAt).toISOString() as never;
  res.status(201).json(RegisterResponse.parse(safeUser));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json(LogoutResponse.parse({ success: true, message: "Logged out" }));
  });
});

export default router;
