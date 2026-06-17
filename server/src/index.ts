import express from "express";

const app = express();

// The backend runs on a different port than the Vite frontend (which uses 5173).
// 3000 is a conventional choice for a Node/Express API in development.
const PORT = process.env.PORT ?? 3000;

// A single "hello" route. Phase 0's only job is to prove the server runs and
// responds. Real routes (GET /teams, etc.) arrive in Phase 1.
app.get("/", (_req, res) => {
  res.json({ message: "Hello from the Pokémon Team Showcase API 👋" });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
