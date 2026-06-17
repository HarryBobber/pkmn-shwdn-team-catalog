# CLAUDE.md — Pokémon Team Showcase

> Project memory for Claude Code. This file captures locked decisions, architecture,
> and conventions for this project. Read it before proposing changes. When a decision
> here conflicts with a habit or default, this file wins. If something is genuinely
> ambiguous or missing, ask before assuming.

---

## Developer context (read first)

- The developer is **new to both React and backend/database work.** Calibrate explanations
  accordingly: explain *why*, not just *what*, and prefer one new concept at a time.
- This is a **learning project.** Speed and cleverness are secondary to understanding.
  Favor readable, conventional code over slick abstractions.
- Environment: **WSL (Linux), CLI-based workflow.** Assume a Unix shell.
- Language: **TypeScript throughout**, frontend and backend.
- Guiding rule: **learn/build one layer at a time.** Do not let a later phase's concerns
  leak into an earlier phase. The fun parts (3D) come last, on top of working plumbing.

---

## What this project is

A **public showcase** of the owner's Pokémon competitive teams, with a 3D presentation layer.

- **Anyone can view** teams (public read).
- **Only the owner can create, edit, or delete** teams (protected write).
- Teams are managed via the **Pokémon Showdown copy-paste text format** — that text is the
  create/edit *interface*, not a visual team builder.
- Later phases add a 3D model view and a browser extension that tracks battle stats.

This is intentionally scoped small. Do **not** build features beyond the current phase.

---

## Tech stack (LOCKED — do not substitute without asking)

**Frontend**
- React + **Vite** (SPA; no Next.js / no SSR — 3D is client-side anyway)
- **React Three Fiber** (`@react-three/fiber`) + **`@react-three/drei`** for 3D
- **TanStack Query** (`@tanstack/react-query`) for all server-state / data fetching
- **Tailwind CSS** for non-3D UI styling
- React built-in hooks for local UI state; add **Zustand** only if state sharing gets complex
- **TypeScript**

**Backend**
- **Node + Express** for the API (Hono is an acceptable alternative but Express is the default here)
- **Prisma** ORM
- **SQLite** to start (zero-config, single file); migrate to **Postgres** later (Prisma makes this easy)
- **TypeScript**

**Pokémon data — use these, do NOT hand-roll Pokédex data**
- `@pkmn/dex` — species, moves, items, abilities, base stats (the data layer)
- `@pkmn/data` — friendlier, generation-aware wrapper over `@pkmn/dex`
- `@pkmn/sets` — parse and generate the Showdown copy-paste format (core of create/edit)
- `@pkmn/img` — 2D sprites (used as placeholder before real 3D models)
- `@pkmn/client` — parses Showdown's live battle log (ONLY relevant to the future extension)
- `@pkmn/sim` — includes `TeamValidator` if/when in-app validation is wanted (see Validation)

> Note: `@pkmn` is an npm *scope* (namespace) of community-maintained, Smogon-adjacent
> packages extracted from the open-source Pokémon Showdown codebase. This is open-source
> data/logic, NOT Nintendo/Game Freak assets — safe to use.

---

## Architecture

- **Public read endpoints**, e.g. `GET /teams`, `GET /teams/:id` — no auth.
- **Owner-only write endpoints**, e.g. `POST /teams`, `PUT /teams/:id`, `DELETE /teams/:id`
  — protected by a **single admin token / password** that write routes check. This is
  **not** user accounts and **not** a full auth system. Visitors never see it.
- Frontend talks to the API via TanStack Query; mutations invalidate the relevant query so
  the team list refreshes after a save/delete.

---

## Data model

The Showdown paste text is the **edit interface**, but **structured rows are what we store**,
because rendering the right 3D models and the future analytics require querying species,
items, and moves as real data — not as one text blob.

**Save flow:** paste text in → parse with `@pkmn/sets` → store structured rows.
**Edit flow:** load structured rows → regenerate paste text → show in a textarea → re-parse on save.
(Optionally also keep the original raw paste text for fidelity.)

**Schema (designed now to anticipate later phases):**

- `Team`
  - `id`
  - `name`
  - `generation`  ← **functional, not cosmetic.** Required to parse the paste correctly
                     (move legality / mechanics differ by gen) and to drive any validation.
  - `tier` / `format`  ← organizational only; may be nullable for now
  - `notes`  ← optional
  - (optional) `rawPaste` — original pasted text
- `TeamMember` (a `Team` has up to 6)
  - `id`, `teamId`
  - `species`, `item`, `ability`, `nature`, `level`
  - `moves` (4), `evs`, `ivs`, `teraType` (gen 9), `nickname`, `gender`, etc.
- `Battle` / `TeamStats` — **create the table now, populate later.** Anticipates the
  extension: win/loss, avg Pokémon alive at win, peak rank achieved, etc. Designing it
  in now avoids a painful migration later.
- `User` — **does NOT exist yet.** Single-user for now. Adding it later is an additive
  change; design relations so this stays additive.

---

## Validation (deferred)

- **Not implemented for now.** The owner validates teams in Pokémon Showdown's teambuilder
  *before* pasting, so the app trusts its input.
- Distinguish **parsing** (is the text well-formed? — required) from **validation** (is the
  team legal for its format? — deferred). Even with validation deferred, **handle parse
  failures gracefully**: if `@pkmn/sets` can't parse the input, tell the owner clearly
  instead of storing junk.
- There is **no public web API** at showdown.com to validate teams. If in-app validation is
  ever wanted, use `@pkmn/sim`'s `TeamValidator` (runs in Node or the browser); it takes a
  format ID like `gen9ou` plus the parsed team and returns a list of problems, or nothing if
  legal. Confirm exact API in the package README at build time.

---

## 3D models (the risky part — handle last)

- Sourcing 800+ hostable 3D Pokémon models is the biggest practical/legal risk. Official
  models are Nintendo/Game Freak IP and must **not** be hosted, especially for a public site.
- **Decouple the rendering pipeline from asset sourcing.** Build the 3D layer against
  `@pkmn/img` 2D sprites first, then placeholder primitives / a few free low-poly test
  models, and only resolve real-model sourcing at the very end.
- R3F wants glTF/GLB, optimized (we may render six at once).

---

## Build roadmap (do phases in order; do not skip ahead)

0. **Environment** — Node, editor, a running Vite+React+TS app and a separate Express+TS
   server returning a hello response. Prove the toolchain works.
1. **DB + API** — Prisma schema, run a migration, seed a couple of teams by hand, write
   `GET /teams` and `GET /teams/:id`. Test with browser/curl/Postman. No frontend yet.
2. **The connection** — React + TanStack Query fetch and list teams as plain 2D cards.
   Ugly is fine. This is the core skill: request → loading → render.
3. **Create / edit / delete** — textarea for Showdown paste, parse via `@pkmn/sets`,
   species data via `@pkmn/dex`; protected write endpoints + admin token.
4. **3D layer** — introduce R3F: sprites, then placeholder models, then (eventually) real ones.
5. **Polish** — animations, transitions, the "cool look."
6. **Extension** — Manifest V3 content script reads Showdown battle results (parse with
   `@pkmn/client`) and POSTs them to the API, populating the `Battle`/stats table.

---

## Conventions & guardrails

- **Do not** build a visual team builder (move/item/EV dropdowns). The paste textarea is the editor.
- **Do not** source or commit real 3D Pokémon models early (IP risk + scope creep).
- **Do not** add user accounts / full auth. Single admin token for writes only.
- **Do not** implement legality validation yet.
- **Do not** jump to the 3D layer before Phases 0–3 work end to end.
- **Do** keep the database the source of structured truth; paste text is an interface.
- **Do** store `generation` on every team — it's required for parsing.
- **Do** prefer conventional, well-documented patterns over clever ones (learning project).
- **Do** explain reasoning in commits/PRs and when proposing code, since the developer is learning.

---

## Useful local tooling

- `npx prisma studio` — visual browser view of the SQLite data (great for a beginner).
- `npx prisma migrate dev` — create/apply migrations after schema changes.
- Plain `git` in the WSL shell is sufficient for version control; a GitHub MCP server is
  optional and only worth adding once issues/PRs become part of the workflow.