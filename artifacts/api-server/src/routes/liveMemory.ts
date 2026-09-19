import { Router, type IRouter, type Request } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

// ---------------------------------------------------------------------------
// Live Memory — a turn-based multiplayer memory-match game for up to 4
// players, joined by room code. Unlike Live Race (where each player answers
// independently), everyone here shares one board and takes turns, so the
// server holds the single source of truth for the board and whose turn it
// is. Clients poll GET /live-memory/rooms/:code to stay in sync.
//
// Self-contained: no DB schema, OpenAPI spec, or generated client changes.
// ---------------------------------------------------------------------------

const router: IRouter = Router();

type RoomStatus = "waiting" | "active" | "finished";
type CardState = "hidden" | "revealed" | "matched";

type Card = {
  value: string;
  state: CardState;
};

type MemoryPlayer = {
  userId: number;
  displayName: string;
  score: number;
  joinedAt: number;
};

type MemoryRoom = {
  code: string;
  hostUserId: number;
  status: RoomStatus;
  createdAt: number;
  players: Map<number, MemoryPlayer>;
  playerOrder: number[]; // turn order, set when the game starts
  currentTurnIndex: number;
  cards: Card[];
  pendingIndices: number[]; // 0, 1, or 2 indices currently face-up this turn
  lastReveal: { indices: number[]; values: string[]; matched: boolean } | null; // ephemeral, for the "flash" animation
};

const rooms = new Map<string, MemoryRoom>();

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_PLAYERS = 4;
const EMOJI_PAIRS = ["\uD83C\uDF4E", "\uD83C\uDF4C", "\uD83C\uDF47", "\uD83C\uDF4A", "\uD83C\uDF53", "\uD83C\uDF49", "\uD83C\uDF52", "\uD83E\uDD5D"]; // matches the single-player Memory game's fruit set
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;

function generateRoomCode(): string {
  let code = "";
  do {
    code = Array.from({ length: 5 }, () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildShuffledBoard(): Card[] {
  const values = shuffle([...EMOJI_PAIRS, ...EMOJI_PAIRS]);
  return values.map((value) => ({ value, state: "hidden" as CardState }));
}

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

async function currentUser(req: Request): Promise<{ id: number; displayName: string } | null> {
  const userId = getSessionUserId(req);
  if (!userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return null;
  return { id: user.id, displayName: user.displayName };
}

function isBoardComplete(room: MemoryRoom): boolean {
  return room.cards.every((c) => c.state === "matched");
}

// Only include card values for cards the requesting view is allowed to see
// (revealed or matched) — hidden cards never leak their value over the wire.
function serializeRoom(room: MemoryRoom) {
  const players = Array.from(room.players.values())
    .sort((a, b) => (b.score - a.score) || (a.joinedAt - b.joinedAt))
    .map((p, i) => ({ userId: p.userId, displayName: p.displayName, score: p.score, rank: i + 1 }));

  const currentTurnUserId = room.status === "active" ? room.playerOrder[room.currentTurnIndex] ?? null : null;

  return {
    code: room.code,
    hostUserId: room.hostUserId,
    status: room.status,
    players,
    playerCount: room.players.size,
    maxPlayers: MAX_PLAYERS,
    currentTurnUserId,
    cards: room.cards.map((c) => ({ state: c.state, value: c.state === "hidden" ? null : c.value })),
    lastReveal: room.lastReveal,
  };
}

router.post("/live-memory/rooms", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const code = generateRoomCode();
  const room: MemoryRoom = {
    code,
    hostUserId: user.id,
    status: "waiting",
    createdAt: Date.now(),
    players: new Map([[user.id, { userId: user.id, displayName: user.displayName, score: 0, joinedAt: Date.now() }]]),
    playerOrder: [],
    currentTurnIndex: 0,
    cards: [],
    pendingIndices: [],
    lastReveal: null,
  };
  rooms.set(code, room);
  res.status(201).json({ room: serializeRoom(room) });
});

router.post("/live-memory/rooms/:code/join", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found. Double-check the code." }); return; }
  if (room.status === "finished") { res.status(409).json({ error: "This game has already finished." }); return; }

  if (!room.players.has(user.id)) {
    if (room.players.size >= MAX_PLAYERS) {
      res.status(409).json({ error: "This room is full (max 4 players)." });
      return;
    }
    if (room.status === "active") {
      res.status(409).json({ error: "This game has already started." });
      return;
    }
    room.players.set(user.id, { userId: user.id, displayName: user.displayName, score: 0, joinedAt: Date.now() });
  }
  res.json({ room: serializeRoom(room) });
});

router.post("/live-memory/rooms/:code/start", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found." }); return; }
  if (room.hostUserId !== user.id) { res.status(403).json({ error: "Only the host can start the game." }); return; }
  if (room.players.size < 2) { res.status(409).json({ error: "Need at least 2 players to start." }); return; }

  if (room.status === "waiting") {
    room.status = "active";
    room.cards = buildShuffledBoard();
    room.playerOrder = shuffle(Array.from(room.players.keys()));
    room.currentTurnIndex = 0;
    room.pendingIndices = [];
    room.lastReveal = null;
  }
  res.json({ room: serializeRoom(room) });
});

router.post("/live-memory/rooms/:code/flip", async (req, res): Promise<void> => {
  const user = await currentUser(req);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found." }); return; }
  if (room.status !== "active") { res.status(409).json({ error: "The game isn't active." }); return; }

  const currentTurnUserId = room.playerOrder[room.currentTurnIndex];
  if (currentTurnUserId !== user.id) { res.status(403).json({ error: "It's not your turn." }); return; }

  const index = Number(req.body?.index);
  if (!Number.isInteger(index) || index < 0 || index >= room.cards.length) {
    res.status(400).json({ error: "Invalid card index." });
    return;
  }
  const card = room.cards[index];
  if (card.state !== "hidden") { res.status(409).json({ error: "That card is already face-up." }); return; }
  if (room.pendingIndices.includes(index)) { res.status(409).json({ error: "That card is already selected." }); return; }

  card.state = "revealed";
  room.pendingIndices.push(index);
  room.lastReveal = null;

  if (room.pendingIndices.length === 2) {
    const [i1, i2] = room.pendingIndices;
    const c1 = room.cards[i1];
    const c2 = room.cards[i2];
    const matched = c1.value === c2.value;

    if (matched) {
      c1.state = "matched";
      c2.state = "matched";
      const player = room.players.get(user.id);
      if (player) player.score += 1;
      room.lastReveal = { indices: [i1, i2], values: [c1.value, c2.value], matched: true };
      // Matching player keeps their turn (classic memory-game rule).
    } else {
      c1.state = "hidden";
      c2.state = "hidden";
      room.lastReveal = { indices: [i1, i2], values: [c1.value, c2.value], matched: false };
      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.playerOrder.length;
    }
    room.pendingIndices = [];

    if (isBoardComplete(room)) {
      room.status = "finished";
    }
  }

  res.json({ room: serializeRoom(room) });
});

router.get("/live-memory/rooms/:code", async (req, res): Promise<void> => {
  const code = String(req.params.code || "").toUpperCase();
  const room = rooms.get(code);
  if (!room) { res.status(404).json({ error: "Room not found." }); return; }
  res.json({ room: serializeRoom(room) });
});

export default router;
