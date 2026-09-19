import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

// express-session's type augmentation isn't set up in this project, so we
// access session.userId through a small typed helper instead of `as any`
// scattered across every route file.
function getSessionUserId(req: Request): number | undefined {
  const session = req.session as unknown as { userId?: number };
  return session?.userId;
}

/**
 * Requires an active session (i.e. the person is logged in). Until this was
 * added, no route in the API checked this at all — any request could read
 * or write any user's data just by knowing/guessing their id.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!getSessionUserId(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

/**
 * Requires the logged-in user's role to be one of `roles`.
 */
export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getSessionUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    next();
  };
}

/**
 * Requires either:
 *  - the logged-in user IS the user referenced by the given route param
 *    (e.g. a student viewing their own progress), or
 *  - the logged-in user's role is one of `elevatedRoles` (e.g. a teacher or
 *    admin monitoring a student's progress).
 */
export function requireSelfOrRole(paramName: string, elevatedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sessionUserId = getSessionUserId(req);
    if (!sessionUserId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const raw = req.params[paramName];
    const targetUserId = parseInt(Array.isArray(raw) ? raw[0] : raw, 10);

    if (!isNaN(targetUserId) && targetUserId === sessionUserId) {
      next();
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));
    if (user && elevatedRoles.includes(user.role)) {
      next();
      return;
    }

    res.status(403).json({ error: "Not authorized" });
  };
}

/**
 * Same as requireSelfOrRole, but for POST endpoints where the target user id
 * is in the request body (data.userId) rather than a route param.
 */
export function requireSelfOrRoleInBody(elevatedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sessionUserId = getSessionUserId(req);
    if (!sessionUserId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const bodyUserId = req.body?.data?.userId ?? req.body?.userId;

    if (bodyUserId === sessionUserId) {
      next();
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sessionUserId));
    if (user && elevatedRoles.includes(user.role)) {
      next();
      return;
    }

    res.status(403).json({ error: "Not authorized" });
  };
}
