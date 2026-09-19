import { Router, type IRouter, type Request } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

// ---------------------------------------------------------------------------
// Live Race — a lightweight multiplayer "leaderboard" game.
//
// This is intentionally self-contained: it does NOT touch the OpenAPI spec,
// the generated zod schemas, or the database schema/migrations used by the
// rest of the app. Rooms live in memory on this server process and are
// polled by clients (GET /live-race/rooms/:code) roughly every 1.5s, which
// keeps "live" position updates simple without adding a websocket
// dependency or any new shared infrastructure.
//
// Any authenticated user can create a room (gets a short shareable code) or
// join an existing one by code. Everyone answers their own stream of quick
// questions; the server just tracks each player's score and rank.
//
// Each room is locked to one subject + specific topic (e.g. Math ›
// "Addition"), chosen when the room is created — the actual question
// content lives client-side (see game-live-race.tsx); this server only
// needs to know which topic to tell every player in the room to use.
// Rooms support up to MAX_ROUNDS "play again" rounds with the same code —
// every round replays the same topic. After a round finishes, the host can
// start the next (same or different players may be in the room); after the
// final round the room closes and the code stops working.
// ---------------------------------------------------------------------------

const router: IRouter = Router();

type RoomStatus = "waiting" | "active" | "finished" | "closed";
type Subject = "math" | "science" | "geography" | "pshe";

const MAX_ROUNDS = 3;
const SUBJECTS: Subject[] = ["math", "science", "geography", "pshe"];

type Player = {
  userId: number;
  displayName: string;
  score: number;
  joinedAt: number;
};

type Room = {
  code: string;
  hostUserId: number;
  subject: Subject;
  topic: string;
  topicTitle: string;
  status: RoomStatus;
  round: number;
  durationSeconds: number;
  createdAt: number;
  startedAt: number | null;
  endsAt: number | null;
  players: Map<number, Player>;
};

const rooms = new Map<string, Room>();

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easier to read aloud
const DEFAULT_DURATION_SECONDS = 120; // every round is at least 120 seconds
const ROOM_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours after creation, rooms are swept up

function generateRoomCode(): string {
  let code = "";
  do {
    code = Array.from({ length: 5 }, () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]).join("");
  } while (rooms.has(code));
  return code;
}

// Periodic cleanup so long-lived server processes don't accumulate rooms
// from abandoned sessions. Doesn't touch any other feature's data.
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.createdAt > ROOM_TTL_MS) rooms.delete(code);
  }
}, 10 * 60 * 1000);
cleanupTimer.unref();

function getSessionUserId(req: Request): number | undefined {
  const session = req.session as unknown as { userId?: number };
  return session?.userId;
}

// Lazily flips a room from "active" to "finished" (or "closed", if that was
// the final round) once its time is up — avoids needing a server-side timer
// per room.
function finalizeIfExpired(room: Room): void {
  if (room.status === "active" && room.endsAt !== null && Date.now() >= room.endsAt) {
    room.status = room.round >= MAX_ROUNDS ? "closed" : "finished";
  }
}

function serializeRoom(room: Room) {
  finalizeIfExpired(room);
  const players = Array.from(room.players.values())
    .sort((a, b) => (b.score - a.score) || (a.joinedAt - b.joinedAt))
    .map((p, i) => ({
      userId: p.userId,
      displayName: p.displayName,
      score: p.score,
      rank: i + 1,
    }));
  const timeRemaining =
    room.status === "active" && room.endsAt !== null
      ? Math.max(0, Math.round((room.endsAt - Date.now()) / 1000))
      : 0;
  return {
    code: room.code,
    hostUserId: room.hostUserId,
    subject: room.subject,
    topic: room.topic,
    topicTitle: room.topicTitle,
    status: room.status,
    round: room.round,
    maxRounds: MAX_ROUNDS,
    durationSeconds: room.durationSeconds,
    timeRemaining,
    players,
  };
}

async function currentUser(req: Request): Promise<{ id: number; displayName: string } | null> {
  const userId = getSessionUserId(req);
  if (!userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return null;
  return { id: user.id, displayName: user.displayName };
}

router.post("/live-race/rooms", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const requestedSubject = String(req.body?.subject || "");
  const subject: Subject = SUBJECTS.includes(requestedSubject as Subject) ? (requestedSubject as Subject) : "math";
  const topic = String(req.body?.topic || "").slice(0, 100);
  const topicTitle = String(req.body?.topicTitle || "").slice(0, 200);
  if (!topic || !topicTitle) { res.status(400).json({ error: "A topic must be chosen to create a room." }); return; }

  const code = generateRoomCode();
  const room: Room = {
    code,
    hostUserId: user.id,
    subject,
    topic,
    topicTitle,
    status: "waiting",
    round: 1,
    durationSeconds: DEFAULT_DURATION_SECONDS,
    createdAt: Date.now(),
    startedAt: null,
    endsAt: null,
    players: new Map([[user.id, { userId: user.id, displayName: user.displayName, score: 0, joinedAt: Date.now() }]]),
  };
  rooms.set(code, room);
  res.status(201).json({ room: serializeRoom(room) });
});

router.post("/live-race/rooms/:code/join", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found. Double-check the code." }); return; }
  finalizeIfExpired(room);
  if (room.status === "closed") { res.status(409).json({ error: "This room has finished all its rounds and is now closed." }); return; }

  if (!room.players.has(user.id)) {
    room.players.set(user.id, { userId: user.id, displayName: user.displayName, score: 0, joinedAt: Date.now() });
  }
  res.json({ room: serializeRoom(room) });
});

router.post("/live-race/rooms/:code/start", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found." }); return; }
  if (room.hostUserId !== user.id) { res.status(403).json({ error: "Only the host can start the race." }); return; }

  if (room.status === "waiting") {
    room.status = "active";
    room.startedAt = Date.now();
    room.endsAt = room.startedAt + room.durationSeconds * 1000;
  }
  res.json({ room: serializeRoom(room) });
});

// Starts the next round in the same room (same code) — used for "Play
// Again". Resets everyone's score for a clean scoreboard each round, but
// deliberately does NOT touch which questions each player has already
// seen: that's tracked client-side per player and persists across rounds
// for as long as they stay on the page, which is what guarantees no
// question repeats across all rounds in this room.
router.post("/live-race/rooms/:code/next-round", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found." }); return; }
  if (room.hostUserId !== user.id) { res.status(403).json({ error: "Only the host can start the next round." }); return; }
  finalizeIfExpired(room);
  if (room.status !== "finished") { res.status(409).json({ error: "The current round hasn't finished yet." }); return; }
  if (room.round >= MAX_ROUNDS) { res.status(409).json({ error: "This room has already completed all its rounds." }); return; }

  room.round += 1;
  room.status = "waiting";
  room.startedAt = null;
  room.endsAt = null;
  for (const player of room.players.values()) player.score = 0;

  res.json({ room: serializeRoom(room) });
});

router.post("/live-race/rooms/:code/answer", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found." }); return; }
  finalizeIfExpired(room);

  const player = room.players.get(user.id);
  if (!player) { res.status(403).json({ error: "Join the room before answering." }); return; }

  if (room.status === "active" && req.body?.correct === true) {
    player.score += 1;
  }
  res.json({ room: serializeRoom(room) });
});

router.get("/live-race/rooms/:code", async (req, res): Promise<void> => {
  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found." }); return; }
  res.json({ room: serializeRoom(room) });
});

export default router;
