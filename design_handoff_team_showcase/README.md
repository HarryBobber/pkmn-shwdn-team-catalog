# Handoff: Pokémon Team Showcase

## Overview
A retro, pixel/game-UI screen that displays a competitive Pokémon team of up to **6 members** as
animated 3D "crystal" placeholders arranged in a **2 × 3 grid**. Hovering a member fades in a
semi-transparent info panel showing its item, ability, nature, four moves, base stats (with bars),
EVs, IVs, Tera type and BST. A **team selector** above the grid lets the user switch between
multiple saved teams. The backdrop evokes a **Gen-5 (Black/White) pixel battle scene** (night sky,
star field, glowing horizon, receding perspective grid floor).

The crystal models are intentional **placeholders** — they are meant to be replaced with real 3D
Pokémon models (e.g. `.glb`/`.gltf` rendered via three.js / `<model-viewer>`) once available.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the
intended look and behavior, **not** production code to copy verbatim. The task is to **recreate this
design in your target codebase** (React, Vue, Svelte, etc.) using its established patterns, then wire
the team data to **your backend**. If no front-end environment exists yet, pick the most appropriate
framework and implement there.

> Note on the prototype's tech: the HTML file is a "Design Component" — a custom streaming runtime
> (`support.js`). **Do not adopt that runtime.** Read it only to understand layout/markup/styles. All
> the real design intent (markup structure, inline styles, animations, data model, interactions) is
> described below and is framework-agnostic.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, animations and interactions are all
specified. Recreate pixel-for-pixel using your codebase's libraries — except the 3D crystal, which is
a placeholder for a real model viewer.

---

## Screens / Views

There is a single screen with three stacked regions inside a centered **max-width: 1080px** column
(outer page padding `32px 28px 240px`; the large bottom padding leaves room for hover panels of the
bottom row).

### 1. Title bar
- Full-width bar, `border: 3px solid #4b4870`, background `linear-gradient(180deg,#23213a,#16142a)`,
  `box-shadow: 0 0 0 3px #0b0b14, 6px 6px 0 rgba(0,0,0,0.5)`, padding `15px 20px`.
- Flex row, space-between, 3 zones: left `TRAINER <name>` (name in `#ffd24a`), center current team
  label (`#7af0c8`), right `TEAM <count>/6` (count in `#7af0c8`).
- All caps, font **Press Start 2P**, 10–12px.

### 2. Team selector
- Flex row: `◀` button (42px wide) · horizontally-scrollable strip of team tabs · `▶` button.
- Arrow buttons: `border:3px solid #3a385c`, bg `#14122a`, color `#bdb8ea`, `box-shadow:0 0 0 3px #0b0b14`, 20px glyph.
- Each **team tab** (button): `border:3px solid <border>`, bg `<bg>`, `box-shadow:0 0 0 3px #0b0b14, <shadow>`,
  padding `10px 14px`, column layout gap 9px. Contains:
  - Team label, Press Start 2P 9px.
  - A row of **6 mini dots** (10×10px, `border:1px solid #0b0b14`) colored by each member's primary type — a quick team preview.
  - **Active** tab: border `#ffd24a`, bg `linear-gradient(180deg,#2a2746,#1c1936)`, label `#ffd24a`, lifted `translateY(-3px)`, shadow `4px 7px 0 rgba(0,0,0,0.45)`.
  - **Inactive** tab: border `#3a385c`, bg `#14122a`, label `#8e8ab8`, no lift, shadow `4px 4px 0 rgba(0,0,0,0.4)`.

### 3. Team grid (2 × 3)
- `display:grid; grid-template-columns:repeat(3,1fr); gap:24px`.
- Each **member card**: `position:relative`, `border:3px solid #3a385c`,
  bg `linear-gradient(180deg, rgba(25,23,48,0.93), rgba(18,16,36,0.93))`, padding `18px 16px 16px`.
  - Resting `box-shadow: 0 0 0 3px #0b0b14, 5px 5px 0 rgba(0,0,0,0.45)`.
  - **Hover**: card lifts `translateY(-6px)`; box-shadow becomes
    `0 0 0 3px <typeColor>, 5px 11px 0 rgba(0,0,0,0.45), 0 0 28px color-mix(in srgb, <typeColor> 55%, transparent)`.
  - Transition `transform .12s ease, box-shadow .12s ease`.
- Card contents top→bottom:
  1. **Crystal scene** (height 168px, centered, `perspective:680px`) — see "Crystal placeholder" below.
  2. **Name** — Press Start 2P 12px, `#f5f3ff`, `text-shadow:2px 2px 0 #000`.
  3. **Type chips** — flex row gap 6px; each chip Press Start 2P 8px, text `#0b0b14`, bg = type color,
     `border:2px solid #0b0b14`, padding `4px 7px`.
  4. **Tera line** — VT323 18px `#8e8ab8`: `TERA ◆ <type>` with `◆ <type>` colored by the Tera type color.

#### Crystal placeholder (REPLACE WITH REAL MODEL)
A CSS 3-D cube faked as a gem. Structure: a bob wrapper (`@keyframes bob`, 3.2s) → tilt wrapper
(`rotateX(-16deg)`, scales to `1.07` on hover) → spinner (90×90px, `transform:scaleY(1.22)`,
`@keyframes spin` 4.6s linear, **`animation-play-state: paused` by default, `running` on hover**) → 6
faces translated ±45px. Faces tinted with `color-mix(in srgb, <typeColor> 52–60%, transparent)`,
`border:1px solid color-mix(in srgb,<typeColor> 75%,#fff)`, inner glow via inset box-shadow, per-face
`filter:brightness()` for shading. A blurred radial ellipse under it (`@keyframes shadowpulse`) grounds it.
**When swapping in real models:** keep the 168px scene box, the bob/idle, and "spin only on hover";
render the model where the cube is, tinted/lit by the member's primary type color.

#### Hover info panel
- Absolutely positioned inside the card: `left:50%; top:120px; width:330px; z-index:60; pointer-events:none`.
- Hidden: `opacity:0; transform:translateX(-50%) translateY(14px)`. Shown:
  `opacity:1; transform:translateX(-50%) translateY(0)`. Transition `opacity .16s ease, transform .16s ease`.
- Style: `border:3px solid <typeColor>`, bg `rgba(12,11,24,0.88)`, `backdrop-filter:blur(3px)`,
  `box-shadow:0 0 0 3px #0b0b14, 6px 6px 0 rgba(0,0,0,0.55), 0 0 30px color-mix(in srgb,<typeColor> 50%,transparent)`,
  padding `14px 14px 15px`.
- Sections:
  - **Header**: name (Press Start 2P 10px `#f5f3ff`) + `◆<Tera>` (VT323 18px, Tera color); bottom border `2px solid #34325a`.
  - **Meta rows** (VT323 18px): `ITEM`/`ABILITY`/`NATURE` labels in `#7d7aa6`, values in `#ffe08a` / `#9fe8ff` / `#f5a3d0`.
  - **Moves**: 2×2 grid, gap 5px; each chip VT323 16px `#e6e4ff`, bg `#1c1a36`, `border:2px solid #34325a`,
    `border-left:4px solid <typeColor>`, padding `4px 7px`.
  - **Stats**: 6 rows (HP/ATK/DEF/SPA/SPD/SPE). Each row: label (Press Start 2P 7px `#9794c2`, 30px wide) ·
    bar track (height 9px, bg `#1c1a36`, `border:1px solid #34325a`) with fill `width = min(100, round(stat/200*100))%`
    colored per stat · value (VT323 16px `#e6e4ff`) · EV badge (`+<ev>` when >0, VT323 14px `#6f6c98`).
  - **Footer** (VT323 14px `#6f6c98`, top border `2px solid #34325a`): `IVs <ivLabel> · BST <total>`,
    where `ivLabel` is `31/0/31/31/31/31` when the Atk IV is 0 (special attackers), else `all 31`.

### Backdrop (Gen-5 pixel battle scene)
`position:fixed; inset:0; z-index:0`. Layers:
- Sky: `linear-gradient(180deg,#0a0a1c 0%,#16133a 38%,#241a52 53%,#3a2360 57%,#1d1430 78%,#120d22 100%)`.
- **Star field**: one element with a long `box-shadow` list of 1–2px white/`#c9c2ff`/`#b9b0ff` dots; `@keyframes twinkle` 3.4s.
- **Horizon line** at `top:56.5%`, 2px, `#7a5bff`, glow `0 0 20px 4px rgba(122,91,255,0.55)`.
- **Battle platform ellipse**: 420×60px centered near horizon, `border:3px solid rgba(140,110,255,0.30)`, faint radial fill.
- **Perspective grid floor**: bottom 44%, `transform:perspective(440px) rotateX(66deg)` (origin bottom),
  bg `#0c0920` + two `repeating-linear-gradient` grids (lines `rgba(124,98,235,.45)` / `.30`, 48px pitch),
  `@keyframes drift` 6s (background-position 0→80px), inset shadow `inset 0 60px 80px rgba(8,6,20,0.7)`.
- Vignette overlay: `radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(6,6,14,0.65) 100%)`.

### Scanline overlay (optional)
`position:fixed; inset:0; z-index:200; pointer-events:none`,
`background:repeating-linear-gradient(0deg, rgba(0,0,0,.20) 0 1px, transparent 2px 3px)`, `mix-blend-mode:multiply`.
Toggleable (see Tweaks).

---

## Interactions & Behavior
- **Hover a member card** → set `hovered = index`; that card lifts + glows, **its `z-index` is raised to `100`** (so the overflowing panel renders above neighboring cards — without this the panel is trapped behind later siblings), its crystal spins, its info panel fades in. Mouse leave → `hovered = -1`, `z-index` back to `1`.
- **Click a team tab** → `team = index`, reset `hovered = -1`.
- **◀ / ▶** → cycle `team` index with wraparound, reset `hovered = -1`.
- Team-tab strip scrolls horizontally (`overflow-x:auto`) when there are many teams.
- All transitions use `ease` (durations above). Idle animations (bob, shadowpulse, twinkle, drift, blink) run continuously; the crystal **spin** is gated to hover via `animation-play-state`.
- Bottom hint line: blinking `▸` + `HOVER A POKEMON TO INSPECT · ◀ ▶ SWITCH TEAM`.

## State Management
- `hovered: number` (-1 = none) — which card's panel is open.
- `team: number` — index into the teams array.
- Derived per render: current team, per-member display values (chips, stat bars, EV labels, BST, panel/hover styles).
- **Data fetching**: replace the hardcoded `TEAMS` array with a fetch from your backend. Recommended shape per member below.

## Data model (wire to your backend)
```ts
type Member = {
  name: string;
  types: string[];                 // 1–2 of the type names below (Title-case)
  tera: string;                    // a type name
  item: string;
  ability: string;
  nature: string;
  moves: string[];                 // exactly 4
  stats: { HP:number; ATK:number; DEF:number; SPA:number; SPD:number; SPE:number };
  evs:   { HP:number; ATK:number; DEF:number; SPA:number; SPD:number; SPE:number };
  atkIV: number;                   // 0 for special attackers, else 31 (drives the IV label)
  modelUrl?: string;               // future: .glb/.gltf for the real 3D model
};
type Team = { label: string; members: Member[] };  // up to 6 members
```
Three sample teams (`OU BALANCE`, `RAIN`, `HYPER OFFENSE`) are included in the prototype as reference data.

## Design Tokens

### Fonts
- **Press Start 2P** (headings, labels, names, type chips) — Google Fonts.
- **VT323** (body, stats, moves, meta) — Google Fonts.
- `image-rendering: pixelated` on the root for crisp pixel feel.

### Core colors
| Token | Hex |
|---|---|
| Page base | `#06060e` |
| Card bg | `rgba(25,23,48,0.93)` → `rgba(18,16,36,0.93)` |
| Card / control border | `#3a385c` |
| Hard outer keyline | `#0b0b14` |
| Title bar border | `#4b4870` |
| Panel bg | `rgba(12,11,24,0.88)` |
| Divider | `#34325a` |
| Text primary | `#f5f3ff` |
| Text muted | `#8e8ab8` / `#7d7aa6` / `#6f6c98` |
| Accent yellow (trainer/active) | `#ffd24a` |
| Accent mint (counts/label) | `#7af0c8` |
| Item value | `#ffe08a` · Ability `#9fe8ff` · Nature `#f5a3d0` |
| Backdrop purple lines/glow | `#7a5bff` / `rgba(124,98,235,.45)` |

### Stat bar colors
`HP #7ae36b · ATK #f7625a · DEF #f9c74f · SPA #4d96ff · SPD #43c6ac · SPE #f15bb5`

### Pokémon type colors (used for chips, mini dots, card accent, crystal tint, Tera, panel border)
```
Normal #a8a878  Fire #f0803c  Water #5a8df0  Electric #f7cf3a
Grass #74c84f   Ice #8fd4d4   Fighting #d13f33  Poison #a64fb0
Ground #e0bf5a  Flying #9d8df0  Psychic #f55c8c  Bug #a3bf2a
Rock #bda33a    Ghost #7159a8  Dragon #6e3ef5   Dark #6b5848
Steel #aab0c8   Fairy #ee93b0
```

### Spacing / shape
- Grid gap `24px`; card padding `18px 16px 16px`; page column `max-width 1080px`.
- **No border-radius** anywhere (pixel aesthetic) except the crystal's ground-shadow/platform ellipses (`50%`).
- Signature shadow style: a 3px hard keyline (`0 0 0 3px #0b0b14`) plus a hard offset drop (`Xpx Ypx 0 rgba(0,0,0,.4–.55)`).

### Tweakable props (in the prototype; expose as you see fit)
- `trainerName` (string, default `RED`).
- `accent` (`type` | `cyan` | `gold`): `type` uses each member's primary-type color as its card accent;
  `cyan` = `oklch(0.78 0.16 200)`, `gold` = `oklch(0.82 0.15 85)` apply one accent to all cards.
  Type chips and mini dots always keep true type colors regardless.
- `scanlines` (boolean, default true): toggles the CRT scanline overlay.

## Assets
- **Fonts**: Press Start 2P + VT323 (Google Fonts) — load from your asset pipeline.
- **No image/SVG assets.** The crystal and backdrop are pure CSS. Replace crystals with real model files (`.glb`/`.gltf`) when available.
- Preview screenshots: `preview-grid.png`, `preview-hover.png` (for reference only).

## Files
- `Team Showcase.dc.html` — the design reference (markup, inline styles, animations, sample data, interaction logic). Read for exact values.
- `support.js` — the prototype's runtime. **Reference only — do not port.**
- `preview-grid.png`, `preview-hover.png` — rendered previews.
