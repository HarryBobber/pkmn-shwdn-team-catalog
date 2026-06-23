// Pokémon presentation data for the showcase.
//
// The backend stores what the owner typed (species, item, ability, nature,
// moves, EVs, IVs, tera). It does NOT store a Pokémon's *types* or *base stats* —
// those are intrinsic to the species, so we look them up here from `@pkmn/dex`
// (the same open-source data layer `@pkmn/img` uses for sprites). Deriving them
// on the client keeps the API untouched: one source of truth, no duplicate data.

import { Dex } from '@pkmn/dex'
import type { TeamMember } from './api'

// The six stats, in display order. Our API uses lowercase keys (hp, atk, …);
// the UI labels are upper-case. This pairs the two so we only write it once.
export const STAT_ORDER = [
  { key: 'hp', label: 'HP' },
  { key: 'atk', label: 'ATK' },
  { key: 'def', label: 'DEF' },
  { key: 'spa', label: 'SPA' },
  { key: 'spd', label: 'SPD' },
  { key: 'spe', label: 'SPE' },
] as const

export type StatKey = (typeof STAT_ORDER)[number]['key']

// Per-stat bar colors (from the design tokens).
export const STAT_COLORS: Record<StatKey, string> = {
  hp: '#7ae36b',
  atk: '#f7625a',
  def: '#f9c74f',
  spa: '#4d96ff',
  spd: '#43c6ac',
  spe: '#f15bb5',
}

// Pokémon type colors — used for chips, mini dots, card accent, crystal tint,
// tera, and panel borders. Keyed by the Title-case type names `@pkmn/dex` returns.
export const TYPE_COLORS: Record<string, string> = {
  Normal: '#a8a878',
  Fire: '#f0803c',
  Water: '#5a8df0',
  Electric: '#f7cf3a',
  Grass: '#74c84f',
  Ice: '#8fd4d4',
  Fighting: '#d13f33',
  Poison: '#a64fb0',
  Ground: '#e0bf5a',
  Flying: '#9d8df0',
  Psychic: '#f55c8c',
  Bug: '#a3bf2a',
  Rock: '#bda33a',
  Ghost: '#7159a8',
  Dragon: '#6e3ef5',
  Dark: '#6b5848',
  Steel: '#aab0c8',
  Fairy: '#ee93b0',
}

// Fallback accent when a type has no color (shouldn't happen for real types).
const FALLBACK_TYPE = '#9d8df0'

export function typeColor(type: string | null | undefined): string {
  return (type && TYPE_COLORS[type]) || FALLBACK_TYPE
}

// The shape each card needs. We compute it once per member (see toShowcaseMember)
// so the component just renders — no data juggling in the JSX.
export interface ShowcaseMember {
  name: string // display name (nickname if set, else species), upper-cased
  types: string[] // 1–2 Title-case type names
  accent: string // primary-type color, drives the card/crystal accent
  tera: string | null // tera type name (null = none set)
  teraColor: string
  item: string
  ability: string
  nature: string
  moves: string[]
  stats: {
    key: StatKey
    label: string
    value: number // base stat
    pct: number // bar width %, capped at 100
    color: string
    evLabel: string // "+252" when the EV is > 0, else ""
  }[]
  ivLabel: string // "31/0/31/31/31/31" for 0-Atk sets, else "all 31"
  bst: number // base stat total
}

// A dash stands in for a missing optional value, so the panel layout never gaps.
const orDash = (v: string | null | undefined) => (v && v.trim() ? v : '—')

// Turn one stored TeamMember into the view-model above.
export function toShowcaseMember(member: TeamMember): ShowcaseMember {
  // Look up the species in the dex. `.get` always returns an object; check
  // `.exists` so an unknown/misspelled species degrades gracefully instead of
  // throwing. Base stats and types come from here.
  const species = Dex.species.get(member.species)
  const baseStats = species.exists
    ? species.baseStats
    : { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
  const types = species.exists && species.types.length ? species.types : ['Normal']

  const stats = STAT_ORDER.map(({ key, label }) => {
    const value = baseStats[key]
    const ev = member.evs?.[key] ?? 0
    return {
      key,
      label,
      value,
      pct: Math.min(100, Math.round((value / 200) * 100)),
      color: STAT_COLORS[key],
      evLabel: ev > 0 ? `+${ev}` : '',
    }
  })

  const bst = STAT_ORDER.reduce((sum, { key }) => sum + baseStats[key], 0)

  // The IV label mirrors the design: special attackers run 0 Atk IVs (to take
  // less Foul Play / confusion damage), shown as "31/0/31/31/31/31".
  const atkIV = member.ivs?.atk ?? 31

  return {
    name: (member.nickname ?? member.species).toUpperCase(),
    types,
    accent: typeColor(types[0]),
    tera: member.teraType,
    teraColor: typeColor(member.teraType),
    item: orDash(member.item),
    ability: orDash(member.ability),
    nature: orDash(member.nature),
    moves: member.moves,
    stats,
    ivLabel: atkIV === 0 ? '31/0/31/31/31/31' : 'all 31',
    bst,
  }
}
