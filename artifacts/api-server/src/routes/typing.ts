import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, typingAssignmentsTable, lessonProgressTable } from "@workspace/db";
import { requireSelfOrRole } from "../middlewares/auth";
import type { Request, Response, NextFunction } from "express";
import { AssignTypingModuleBody, AssignTypingModuleResponse, ListTypingAssignmentsResponseItem } from "@workspace/api-zod";

const router: IRouter = Router();

function getSessionUserId(req: Request): number | undefined {
  const session = req.session as unknown as { userId?: number };
  return session?.userId;
}

// Only parents (of the target student) or teachers/admins may assign a
// module. Parents may only assign to their own linked children.
async function requireCanAssign(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionUserId = getSessionUserId(req);
  if (!sessionUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const [assigner] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));
  if (!assigner || !["parent", "teacher", "admin"].includes(assigner.role)) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }
  const studentId = req.body?.studentId;
  if (assigner.role === "parent") {
    const [child] = await db.select().from(usersTable).where(eq(usersTable.id, studentId));
    if (!child || child.parentId !== sessionUserId) {
      res.status(403).json({ error: "You can only assign modules to your own children" });
      return;
    }
  }
  next();
}

router.post("/typing/assign", requireCanAssign, async (req, res): Promise<void> => {
  const parsed = AssignTypingModuleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const sessionUserId = getSessionUserId(req)!;
  const { studentId, levelId, moduleId, note } = parsed.data;
  const [created] = await db.insert(typingAssignmentsTable)
    .values({ studentId, assignedBy: sessionUserId, levelId, moduleId, note })
    .returning();
  const completed = await isModuleCompleted(created.studentId, created.levelId, created.moduleId);
  res.status(201).json(AssignTypingModuleResponse.parse({ ...created, completed }));
});

router.get("/typing/assignments/:studentId", requireSelfOrRole("studentId", ["parent", "teacher", "admin"]), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
  const studentId = parseInt(raw, 10);
  if (isNaN(studentId)) { res.status(400).json({ error: "Invalid studentId" }); return; }
  const rows = await db.select().from(typingAssignmentsTable).where(eq(typingAssignmentsTable.studentId, studentId));
  const withCompletion = await Promise.all(rows.map(async (row) => ({
    ...row,
    completed: await isModuleCompleted(row.studentId, row.levelId, row.moduleId),
  })));
  res.json(withCompletion.map((row) => ListTypingAssignmentsResponseItem.parse(row)));
});

router.delete("/typing/assignments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const sessionUserId = getSessionUserId(req);
  if (!sessionUserId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const [assignment] = await db.select().from(typingAssignmentsTable).where(eq(typingAssignmentsTable.id, id));
  if (!assignment) { res.status(404).json({ error: "Assignment not found" }); return; }
  const [actor] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));
  const canDelete = assignment.assignedBy === sessionUserId || actor?.role === "admin";
  if (!canDelete) { res.status(403).json({ error: "Not authorized" }); return; }
  await db.delete(typingAssignmentsTable).where(eq(typingAssignmentsTable.id, id));
  res.json({ success: true });
});

async function isModuleCompleted(studentId: number, levelId: string, moduleId: string): Promise<boolean> {
  const [row] = await db.select().from(lessonProgressTable)
    .where(and(
      eq(lessonProgressTable.userId, studentId),
      eq(lessonProgressTable.subject, "typing"),
      eq(lessonProgressTable.lessonId, `${levelId}-${moduleId}`),
    ));
  return !!row;
}

export default router;
