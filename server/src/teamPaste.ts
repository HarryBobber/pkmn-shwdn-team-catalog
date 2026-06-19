import { Teams } from "@pkmn/sets";

// Turns Pokémon Showdown copy-paste text into the structured member rows we store.
// Parsing (is the text well-formed?) is required; validation (is the team legal
// for its format?) is deliberately deferred — see CLAUDE.md.

// A `type` (not `interface`) on purpose: Prisma's JSON input type expects an
// object with an index signature, which a type alias provides but an interface
// does not. This lets `evs`/`ivs` be stored directly into the Json columns.
export type Stats = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
};

export interface ParsedMember {
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
  evs: Stats;
  ivs: Stats;
}

// Empty/blank string -> null; otherwise the trimmed value.
function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

// Ensure a full 6-stat object even if the paste omitted some (or all) stats.
// @pkmn/sets already fills defaults when a line is present; this also covers the
// case where the line is absent entirely (EVs default 0, IVs default 31).
function fillStats(partial: Partial<Stats> | undefined, fallback: number): Stats {
  return {
    hp: partial?.hp ?? fallback,
    atk: partial?.atk ?? fallback,
    def: partial?.def ?? fallback,
    spa: partial?.spa ?? fallback,
    spd: partial?.spd ?? fallback,
    spe: partial?.spe ?? fallback,
  };
}

// Parse a full team paste into member rows. Returns null if the text can't be
// parsed into at least one Pokémon, so callers can respond with a 400.
export function parseTeamPaste(paste: string): ParsedMember[] | null {
  const team = Teams.importTeam(paste);
  if (!team || team.team.length === 0) {
    return null;
  }

  return team.team.map((set, index) => ({
    slot: index + 1,
    species: (set.species ?? "").trim(),
    nickname: clean(set.name), // "" when there's no nickname
    item: clean(set.item),
    ability: clean(set.ability),
    nature: clean(set.nature),
    level: set.level ?? 100,
    gender: clean(set.gender),
    teraType: clean(set.teraType),
    moves: (set.moves ?? []).filter((m): m is string => Boolean(m)),
    evs: fillStats(set.evs, 0),
    ivs: fillStats(set.ivs, 31),
  }));
}
