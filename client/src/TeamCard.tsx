import type { Team } from './api'

// A single team rendered as a plain card: name, generation/format, and a list
// of its Pokémon. Presentational only — it just receives a `team` and shows it.
export function TeamCard({ team }: { team: Team }) {
  return (
    <section className="team-card">
      <h2 className="team-card__name">{team.name}</h2>
      <p className="team-card__meta">
        Gen {team.generation}
        {team.format ? ` · ${team.format}` : ''} · {team.members.length} Pokémon
      </p>

      <ul className="team-card__members">
        {team.members.map((member) => (
          <li key={member.id}>
            {member.species}
            {member.nickname && (
              <span className="team-card__nick"> ({member.nickname})</span>
            )}
            {member.item ? ` @ ${member.item}` : ''}
          </li>
        ))}
      </ul>
    </section>
  )
}
