// All calls to the backend API live here. The base URL defaults to the local
// server; override it later (e.g. in production) with a VITE_API_URL env var.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// These types mirror what the API returns (see the Prisma schema on the server).
// We don't share types across client/server yet — for now we hand-write them.
export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface TeamMember {
  id: number;
  teamId: number;
  slot: number;
  species: string;
  nickname: string | null;
  item: string | null;
  ability: string | null;
  nature: string | null;
  level: number;
  gender: string | null;
  teraType: string | null;
  moves: string[];
  evs: Stats | null;
  ivs: Stats | null;
}

export interface Team {
  id: number;
  name: string;
  generation: number;
  format: string | null;
  tier: string | null;
  notes: string | null;
  rawPaste: string | null;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

// Fetch the list of teams. Throws on a non-2xx response so TanStack Query can
// surface it as an error state.
export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${API_URL}/teams`);
  if (!res.ok) {
    throw new Error(`Failed to load teams (HTTP ${res.status})`);
  }
  return res.json();
}
