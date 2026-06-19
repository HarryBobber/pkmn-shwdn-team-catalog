import { useQuery } from '@tanstack/react-query'
import { fetchTeams } from './api'
import { TeamCard } from './TeamCard'
import './App.css'

function App() {
  // useQuery runs fetchTeams, caches the result under the key ['teams'], and
  // hands back the current state. The three states below are the core skill of
  // this phase: loading → error → data.
  const { data: teams, isPending, isError, error } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  })

  return (
    <main className="app">
      <h1 className="app__title">Pokémon Team Showcase</h1>
      <p className="app__subtitle">A showcase of competitive teams.</p>

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
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ))}
    </main>
  )
}

export default App
