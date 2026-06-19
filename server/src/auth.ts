import type { Request, Response, NextFunction } from "express";

// Gate for owner-only write routes (POST/PUT/DELETE). It checks a single shared
// secret sent as `Authorization: Bearer <token>`.
//
// This is intentionally NOT user accounts — one owner, one secret (see CLAUDE.md).
// Public read routes (GET) do not use this, so anyone can still view teams.
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const adminToken = process.env.ADMIN_TOKEN;

  // If the server has no token configured, refuse all writes rather than
  // silently allowing unauthenticated changes.
  if (!adminToken) {
    res.status(500).json({ error: "Server is missing ADMIN_TOKEN configuration" });
    return;
  }

  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (token !== adminToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
