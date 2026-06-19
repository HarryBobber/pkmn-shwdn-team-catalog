import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteTeam, fetchTeams, type Team } from './api'
import { TeamCard } from './TeamCard'
import { TeamForm } from './TeamForm'
import { AdminBar } from './AdminBar'
import './App.css'

function App() {
  const queryClient = useQueryClient()

  // Admin token: loaded from localStorage so it survives reloads. Setting it
  // (or clearing it) keeps localStorage in sync. isAdmin gates the write UI.
  const [token, setTokenState] = useState(
    () => localStorage.getItem('adminToken') ?? '',
  )
  function setToken(next: string) {
    setTokenState(next)
    if (next) localStorage.setItem('adminToken', next)
    else localStorage.removeItem('adminToken')
  }
  const isAdmin = token !== ''

  // Which team the form is editing: a Team (edit), 'new' (create), or null
  // (form closed).
  const [formTarget, setFormTarget] = useState<Team | 'new' | null>(null)

  const { data: teams, isPending, isError, error } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTeam(id, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })

  function handleDelete(team: Team) {
    if (window.confirm(`Delete "${team.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(team.id)
    }
  }

  return (
    <main className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Pokémon Team Showcase</h1>
          <p className="app__subtitle">A showcase of competitive teams.</p>
        </div>
        <AdminBar token={token} onSetToken={setToken} />
      </header>

      {isAdmin && !formTarget && (
        <button
          type="button"
          className="app__add"
          onClick={() => setFormTarget('new')}
        >
          + Add team
        </button>
      )}

      {formTarget && (
        <TeamForm
          team={formTarget === 'new' ? null : formTarget}
          token={token}
          onClose={() => setFormTarget(null)}
        />
      )}

      {deleteMutation.isError && (
        <p className="status status--error">
          Delete failed: {deleteMutation.error.message}
        </p>
      )}

      {isPending && <p className="status">Loading teams…</p>}

      {isError && (
        <p className="status status--error">
          Could not load teams: {error.message}
        </p>
      )}

      {teams &&
        (teams.length === 0 ? (
          <p className="status">No teams yet.</p>
        ) : (
          <div className="team-grid">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isAdmin={isAdmin}
                onEdit={() => setFormTarget(team)}
                onDelete={() => handleDelete(team)}
              />
            ))}
          </div>
        ))}
    </main>
  )
}

export default App
