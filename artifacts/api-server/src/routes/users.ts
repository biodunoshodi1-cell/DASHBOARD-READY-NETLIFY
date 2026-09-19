import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireSelfOrRole, requireRole } from "../middlewares/auth";
import {
  GetUserParams,
  GetUserResponse,
  UpdateUserParams,
  UpdateUserBody,
  UpdateUserResponse,
  DeleteUserParams,
  DeleteUserResponse,
  ListUsersQueryParams,
  ListUsersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users", requireRole("teacher", "admin"), async (req, res): Promise<void> => {
  const queryParsed = ListUsersQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }
  const { role, page = 1, limit = 20 } = queryParsed.data;
  let query = db.select().from(usersTable);
  const filters = [];
  if (role) filters.push(eq(usersTable.role, role as any));
  const offset = (page - 1) * limit;
  const rows = await db.select().from(usersTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .limit(limit)
    .offset(offset);
  const countRows = await db.select().from(usersTable).where(filters.length > 0 ? and(...filters) : undefined);
  const safe = rows.map(({ passwordHash: _, firebaseUid: __, ...u }) => u);
  res.json(ListUsersResponse.parse({ users: safe, total: countRows.length, page, limit }));
});

router.get("/users/:userId", requireSelfOrRole("userId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const { passwordHash: _, firebaseUid: __, ...safe } = user;
  res.json(GetUserResponse.parse(safe));
});

router.patch("/users/:userId", requireSelfOrRole("userId", ["admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [updated] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, userId)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  const { passwordHash: _, firebaseUid: __, ...safe } = updated;
  res.json(UpdateUserResponse.parse(safe));
});

router.delete("/users/:userId", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }
  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, userId)).returning();
  if (!deleted) { res.status(404).json({ error: "User not found" }); return; }
  res.json(DeleteUserResponse.parse({ success: true }));
});

export default router;
