import { prisma } from "../src/db";

// The exact text copied out of Pokémon Showdown for team 1. We keep it in
// `rawPaste` for fidelity; the structured rows below are what we actually query.
const teraGhostPaste = `Great Stache (Kingambit) @ Leftovers
Ability: Supreme Overlord
Tera Type: Ghost
EVs: 4 HP / 252 Atk / 252 Spe
Adamant Nature
- Swords Dance
- Iron Head
- Low Kick
- Sucker Punch

Kommo-o @ Leftovers
Ability: Soundproof
Tera Type: Ghost
EVs: 244 HP / 16 Atk / 248 Spe
Jolly Nature
- Substitute
- Drain Punch
- Shadow Claw
- Clangorous Soul

Iron Valiant @ Booster Energy
Ability: Quark Drive
Tera Type: Ghost
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
IVs: 0 Atk
- Calm Mind
- Moonblast
- Shadow Ball
- Focus Blast

I Just Want a Hug (Kyurem) @ Loaded Dice
Ability: Pressure
Tera Type: Ground
EVs: 220 Atk / 36 SpA / 252 Spe
Naive Nature
- Dragon Dance
- Icicle Spear
- Scale Shot
- Earth Power

Iron Elephant? (Iron Treads) @ Booster Energy
Ability: Quark Drive
Tera Type: Ghost
EVs: 240 HP / 52 Def / 24 SpD / 192 Spe
Jolly Nature
- Stealth Rock
- Earthquake
- Rapid Spin
- Endeavor

Iron Horse (Iron Crown) @ Booster Energy
Ability: Quark Drive
Tera Type: Fighting
EVs: 84 HP / 172 SpA / 252 Spe
Timid Nature
IVs: 20 Atk
- Calm Mind
- Tachyon Cutter
- Psychic Noise
- Focus Blast`;

// Showdown only lists non-default stats. We store the fully-normalized objects:
// EVs default to 0, IVs default to 31. These helpers do that filling so the seed
// data stays readable (we only spell out the values that differ from default).
const ev = (partial: Partial<Stats>): Stats => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...partial });
const iv = (partial: Partial<Stats>): Stats => ({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...partial });

type Stats = { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };

async function main() {
  // Idempotent reseed: clear teams first (cascades to members + battles), so
  // `npm run seed` can be run repeatedly without piling up duplicates.
  await prisma.team.deleteMany();

  await prisma.team.create({
    data: {
      name: "Tera Ghost Bulky Offense",
      generation: 9,
      format: "gen9ou",
      notes: "Sample team pasted from Pokémon Showdown.",
      rawPaste: teraGhostPaste,
      members: {
        create: [
          {
            slot: 1,
            nickname: "Great Stache",
            species: "Kingambit",
            item: "Leftovers",
            ability: "Supreme Overlord",
            teraType: "Ghost",
            nature: "Adamant",
            evs: ev({ hp: 4, atk: 252, spe: 252 }),
            ivs: iv({}),
            moves: ["Swords Dance", "Iron Head", "Low Kick", "Sucker Punch"],
          },
          {
            slot: 2,
            species: "Kommo-o", // no nickname in the paste
            item: "Leftovers",
            ability: "Soundproof",
            teraType: "Ghost",
            nature: "Jolly",
            evs: ev({ hp: 244, atk: 16, spe: 248 }),
            ivs: iv({}),
            moves: ["Substitute", "Drain Punch", "Shadow Claw", "Clangorous Soul"],
          },
          {
            slot: 3,
            species: "Iron Valiant",
            item: "Booster Energy",
            ability: "Quark Drive",
            teraType: "Ghost",
            nature: "Timid",
            evs: ev({ spa: 252, spd: 4, spe: 252 }),
            ivs: iv({ atk: 0 }), // explicit 0 Atk IV
            moves: ["Calm Mind", "Moonblast", "Shadow Ball", "Focus Blast"],
          },
          {
            slot: 4,
            nickname: "I Just Want a Hug",
            species: "Kyurem",
            item: "Loaded Dice",
            ability: "Pressure",
            teraType: "Ground",
            nature: "Naive",
            evs: ev({ atk: 220, spa: 36, spe: 252 }),
            ivs: iv({}),
            moves: ["Dragon Dance", "Icicle Spear", "Scale Shot", "Earth Power"],
          },
          {
            slot: 5,
            nickname: "Iron Elephant?",
            species: "Iron Treads",
            item: "Booster Energy",
            ability: "Quark Drive",
            teraType: "Ghost",
            nature: "Jolly",
            evs: ev({ hp: 240, def: 52, spd: 24, spe: 192 }),
            ivs: iv({}),
            moves: ["Stealth Rock", "Earthquake", "Rapid Spin", "Endeavor"],
          },
          {
            slot: 6,
            nickname: "Iron Horse",
            species: "Iron Crown",
            item: "Booster Energy",
            ability: "Quark Drive",
            teraType: "Fighting",
            nature: "Timid",
            evs: ev({ hp: 84, spa: 172, spe: 252 }),
            ivs: iv({ atk: 20 }), // explicit 20 Atk IV
            moves: ["Calm Mind", "Tachyon Cutter", "Psychic Noise", "Focus Blast"],
          },
        ],
      },
    },
  });

  // A second, smaller team so GET /teams returns a list of more than one.
  await prisma.team.create({
    data: {
      name: "Gen 9 OU Sample",
      generation: 9,
      format: "gen9ou",
      notes: "A short standard-sets sample team.",
      members: {
        create: [
          {
            slot: 1,
            species: "Great Tusk",
            item: "Booster Energy",
            ability: "Protosynthesis",
            teraType: "Steel",
            nature: "Jolly",
            evs: ev({ atk: 252, def: 4, spe: 252 }),
            ivs: iv({}),
            moves: ["Headlong Rush", "Close Combat", "Rapid Spin", "Stealth Rock"],
          },
          {
            slot: 2,
            species: "Gholdengo",
            item: "Air Balloon",
            ability: "Good as Gold",
            teraType: "Flying",
            nature: "Timid",
            evs: ev({ spa: 252, spd: 4, spe: 252 }),
            ivs: iv({ atk: 0 }),
            moves: ["Make It Rain", "Shadow Ball", "Nasty Plot", "Recover"],
          },
          {
            slot: 3,
            species: "Dragapult",
            item: "Choice Specs",
            ability: "Infiltrator",
            teraType: "Ghost",
            nature: "Timid",
            evs: ev({ spa: 252, spd: 4, spe: 252 }),
            ivs: iv({ atk: 0 }),
            moves: ["Draco Meteor", "Shadow Ball", "Flamethrower", "U-turn"],
          },
        ],
      },
    },
  });

  const count = await prisma.team.count();
  console.log(`Seeded database — ${count} teams.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
