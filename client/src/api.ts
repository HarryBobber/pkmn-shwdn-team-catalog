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

// What the owner submits from the create/edit form. The server parses `paste`
// into the structured members; the other fields are entered by hand.
export interface TeamInput {
  name: string;
  generation: number;
  format: string;
  notes: string;
  paste: string;
}

// Shared helper for the owner-only write requests. Attaches the admin token and
// turns the server's { error } JSON into a thrown Error with a readable message.
async function writeRequest(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  token: string,
  body?: unknown,
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Request failed (HTTP ${res.status})`);
  }
  return res;
}

export async function createTeam(input: TeamInput, token: string): Promise<Team> {
  const res = await writeRequest("POST", "/teams", token, input);
  return res.json();
}

export async function updateTeam(
  id: number,
  input: TeamInput,
  token: string,
): Promise<Team> {
  const res = await writeRequest("PUT", `/teams/${id}`, token, input);
  return res.json();
}

export async function deleteTeam(id: number, token: string): Promise<void> {
  await writeRequest("DELETE", `/teams/${id}`, token);
}
