import express from "express";
import { prisma } from "./db";

const app = express();

// The backend runs on a different port than the Vite frontend (which uses 5173).
// 3000 is a conventional choice for a Node/Express API in development.
const PORT = process.env.PORT ?? 3000;

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

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
