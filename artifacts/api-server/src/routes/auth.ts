import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable, userProgressTable } from "@workspace/db";
import {
  LoginBody,
  RegisterBody,
  GetMeResponse,
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  FirebaseSessionBody,
  FirebaseSessionResponse,
} from "@workspace/api-zod";
import { verifyFirebaseIdToken } from "../lib/firebaseAdmin";

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
  const { passwordHash: _, firebaseUid: __, ...safeUser } = user;
  res.json(GetMeResponse.parse(safeUser));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const session = req.session as any;
  session.userId = user.id;
  const { passwordHash: _, firebaseUid: __, ...safeUser } = user;
  res.json(LoginResponse.parse(safeUser));
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, displayName, role, gradeLevel, age } = parsed.data;
  // Check duplicate email
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, displayName, role: role ?? "student", gradeLevel, age })
    .returning();
  // Initialize progress record
  await db.insert(userProgressTable).values({ userId: user.id }).onConflictDoNothing();
  const session = req.session as any;
  session.userId = user.id;
  const { passwordHash: _, firebaseUid: __, ...safeUser } = user;
  res.status(201).json(RegisterResponse.parse(safeUser));
});

router.post("/auth/firebase-session", async (req, res): Promise<void> => {
  const parsed = FirebaseSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { idToken, displayName, role, gradeLevel, age } = parsed.data;

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(idToken);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : "Invalid Firebase ID token" });
    return;
  }

  const firebaseUid = decoded.uid;
  const email = decoded.email;
  if (!email) {
    res.status(400).json({ error: "Firebase account has no email address" });
    return;
  }

  // 1) Already linked to this exact Firebase account
  let [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseUid, firebaseUid));
  let isNewUser = false;

  if (!user) {
    // 2) An existing password-based account with the same email — link it
    // rather than creating a duplicate account for the same person.
    const [existingByEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existingByEmail) {
      [user] = await db
        .update(usersTable)
        .set({ firebaseUid })
        .where(eq(usersTable.id, existingByEmail.id))
        .returning();
    }
  }

  if (!user) {
    // 3) Brand new account. passwordHash is NOT NULL in the schema, so we
    // store an unusable random hash — this account can only ever sign in
    // via Firebase, never via the email/password flow.
    const unusablePasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);
    [user] = await db
      .insert(usersTable)
      .values({
        email,
        passwordHash: unusablePasswordHash,
        firebaseUid,
        displayName: displayName ?? decoded.name ?? email.split("@")[0],
        role: role ?? "student",
        gradeLevel,
        age,
      })
      .returning();
    await db.insert(userProgressTable).values({ userId: user.id }).onConflictDoNothing();
    isNewUser = true;
  }

  const session = req.session as any;
  session.userId = user.id;
  const { passwordHash: _, firebaseUid: __, ...safeUser } = user;
  res.status(isNewUser ? 201 : 200).json(FirebaseSessionResponse.parse(safeUser));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json(LogoutResponse.parse({ success: true, message: "Logged out" }));
  });
});

export default router;
