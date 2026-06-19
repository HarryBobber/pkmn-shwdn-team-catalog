import express from "express";
import cors from "cors";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { parseTeamPaste, type ParsedMember } from "./teamPaste";

const app = express();

// Allow the browser frontend (a different origin: localhost:5173) to call this
// API. Without CORS headers, the browser blocks cross-origin requests. The team
// data is public, so allowing all origins is fine here.
app.use(cors());

// Parse JSON request bodies (needed for POST/PUT write endpoints below).
app.use(express.json());

// The backend runs on a different port than the Vite frontend (which uses 5173).
// 3000 is a conventional choice for a Node/Express API in development.
const PORT = process.env.PORT ?? 3000;

// Validate + normalize the JSON body shared by create (POST) and edit (PUT).
// name/generation/paste are supplied by the owner; the paste is parsed into the
// structured member rows we actually store. Returns either the clean values or
// an error to send back.
interface CleanTeamInput {
  name: string;
  generation: number;
  format: string | null;
  tier: string | null;
  notes: string | null;
  paste: string;
  members: ParsedMember[];
}

function readTeamBody(
  body: unknown,
): { ok: true; value: CleanTeamInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { ok: false, error: "name is required" };

  const generation = Number(b.generation);
  if (!Number.isInteger(generation) || generation < 1 || generation > 9) {
    return { ok: false, error: "generation must be an integer from 1 to 9" };
  }

  const paste = typeof b.paste === "string" ? b.paste : "";
  if (!paste.trim()) return { ok: false, error: "paste is required" };

  // Parsing is required; validation (legality) is deferred (see CLAUDE.md).
  const members = parseTeamPaste(paste);
  if (!members) {
    return { ok: false, error: "Could not parse the Showdown paste — check the format" };
  }

  const optional = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  return {
    ok: true,
    value: {
      name,
      generation,
      format: optional(b.format),
      tier: optional(b.tier),
      notes: optional(b.notes),
      paste,
      members,
    },
  };
}

app.get("/", (_req, res) => {
  res.json({ message: "Hello from the Pokémon Team Showcase API 👋" });
});

// --- Public read endpoints (no auth) ---

// List all teams, newest first, each with its members in slot order.
app.get("/teams", async (_req, res) => {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: { members: { orderBy: { slot: "asc" } } },
  });
  res.json(teams);
});

// Fetch a single team by id, with its members in slot order.
app.get("/teams/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid team id" });
    return;
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include: { members: { orderBy: { slot: "asc" } } },
  });

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  res.json(team);
});

// --- Owner-only write endpoints (require admin token) ---

// Create a team from a Showdown paste plus owner-supplied metadata.
app.post("/teams", requireAdmin, async (req, res) => {
  const parsed = readTeamBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const { name, generation, format, tier, notes, paste, members } = parsed.value;

  const team = await prisma.team.create({
    data: {
      name,
      generation,
      format,
      tier,
      notes,
      rawPaste: paste,
      members: { create: members },
    },
    include: { members: { orderBy: { slot: "asc" } } },
  });

  res.status(201).json(team); // 201 Created
});

// Edit a team: re-parse the paste and replace its members wholesale.
app.put("/teams/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid team id" });
    return;
  }

  const parsed = readTeamBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const { name, generation, format, tier, notes, paste, members } = parsed.value;

  try {
    const team = await prisma.team.update({
      where: { id },
      data: {
        name,
        generation,
        format,
        tier,
        notes,
        rawPaste: paste,
        // Replace members: delete the old set, create the new one. Nested writes
        // run in a single transaction, so slot uniqueness is never violated.
        members: { deleteMany: {}, create: members },
      },
      include: { members: { orderBy: { slot: "asc" } } },
    });
    res.json(team);
  } catch {
    // update throws if the team id doesn't exist.
    res.status(404).json({ error: "Team not found" });
  }
});

// Delete a team (and, via the schema's cascade, its members + battles).
app.delete("/teams/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid team id" });
    return;
  }

  try {
    await prisma.team.delete({ where: { id } });
    res.status(204).send(); // 204 No Content: success, nothing to return
  } catch {
    // prisma.delete throws if the row doesn't exist.
    res.status(404).json({ error: "Team not found" });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
