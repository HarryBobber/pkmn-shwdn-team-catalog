import type { Team } from './api'

// A single team rendered as a card: name, gen/format, and each Pokémon with its
// item, tera type, and moves. When the owner is logged in, shows Edit/Delete.
export function TeamCard({
  team,
  isAdmin,
  onEdit,
  onDelete,
}: {
  team: Team
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <section className="team-card">
      <div className="team-card__top">
        <div>
          <h2 className="team-card__name">{team.name}</h2>
          <p className="team-card__meta">
            Gen {team.generation}
            {team.format ? ` · ${team.format}` : ''} · {team.members.length} Pokémon
          </p>
        </div>
        {isAdmin && (
          <div className="team-card__actions">
            <button type="button" onClick={onEdit}>
              Edit
            </button>
            <button type="button" className="danger" onClick={onDelete}>
              Delete
            </button>
          </div>
        )}
      </div>

      {team.notes && <p className="team-card__notes">{team.notes}</p>}

      <ul className="team-card__members">
        {team.members.map((member) => (
          <li key={member.id} className="member">
            <div className="member__head">
              <strong>{member.species}</strong>
              {member.nickname && (
                <span className="team-card__nick"> ({member.nickname})</span>
              )}
              {member.item ? ` @ ${member.item}` : ''}
              {member.teraType && (
                <span className="team-card__nick"> · Tera {member.teraType}</span>
              )}
            </div>
            {member.moves.length > 0 && (
              <div className="member__moves">{member.moves.join(' / ')}</div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
