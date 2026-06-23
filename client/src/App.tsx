import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteTeam, fetchTeams, type Team } from './api'
import { toShowcaseMember } from './pokemon'
import { Backdrop } from './Backdrop'
import { TeamSelector, type TeamTab } from './TeamSelector'
import { MemberCard } from './MemberCard'
import { TeamForm } from './TeamForm'
import { AdminBar } from './AdminBar'
import './showcase.css'

// The trainer name shown in the title bar (cosmetic).
const TRAINER_NAME = 'LlamaRat'

// Shared "Press Start 2P" helper for the small owner-action buttons.
const ownerButton: React.CSSProperties = {
  fontFamily: "'Press Start 2P'",
  fontSize: 9,
  padding: '8px 12px',
  border: '3px solid #4b4870',
  background: '#1c1936',
  color: '#bdb8ea',
  boxShadow: '0 0 0 3px #0b0b14, 3px 3px 0 rgba(0,0,0,0.4)',
  cursor: 'pointer',
  letterSpacing: '0.5px',
}

function App() {
  const queryClient = useQueryClient()

  // Admin token: loaded from localStorage so it survives reloads. isAdmin gates
  // the write UI (the unlock/log-out lives in <AdminBar/> in the title bar).
  const [token, setTokenState] = useState(() => localStorage.getItem('adminToken') ?? '')
  function setToken(next: string) {
    setTokenState(next)
    if (next) localStorage.setItem('adminToken', next)
    else localStorage.removeItem('adminToken')
  }
  const isAdmin = token !== ''

  // Which team is on screen, and which member's panel is open (-1 = none).
  const [teamIndex, setTeamIndex] = useState(0)
  const [hovered, setHovered] = useState(-1)

  // Form state: a Team (edit), 'new' (create), or null (closed).
  const [formTarget, setFormTarget] = useState<Team | 'new' | null>(null)

  const { data: teams, isPending, isError, error } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTeam(id, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })

  // Derive the showcase view-models once per data change. Each member gains its
  // types/base-stats (from @pkmn/dex) so the cards can render directly. Tabs get
  // a dot per member colored by primary type.
  const decorated = useMemo(() => {
    if (!teams) return []
    return teams.map((team) => {
      const members = team.members.map(toShowcaseMember)
      return { team, members, tab: { label: team.name.toUpperCase(), dots: members.map((m) => m.accent) } as TeamTab }
    })
  }, [teams])

  // Clamp the selected index in case a delete shrank the list past it.
  const safeIndex = decorated.length ? Math.min(teamIndex, decorated.length - 1) : 0
  const current = decorated[safeIndex]

  function selectTeam(index: number) {
    setTeamIndex(index)
    setHovered(-1)
  }
  function cycle(delta: number) {
    if (!decorated.length) return
    const len = decorated.length
    setTeamIndex((i) => (((Math.min(i, len - 1) + delta) % len) + len) % len)
    setHovered(-1)
  }

  function handleDelete() {
    if (!current) return
    if (window.confirm(`Delete "${current.team.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(current.team.id)
      setHovered(-1)
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: '32px 28px 240px',
        fontFamily: "'VT323', monospace",
        overflow: 'hidden',
      }}
    >
      <Backdrop scanlines />

      {/* ===== Title bar ===== */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1080,
          margin: '0 auto 16px',
          border: '3px solid #4b4870',
          background: 'linear-gradient(180deg,#23213a,#16142a)',
          boxShadow: '0 0 0 3px #0b0b14, 6px 6px 0 rgba(0,0,0,0.5)',
          padding: '15px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flex: 1 }}>
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: '#f5f3ff', letterSpacing: 1 }}>
            TRAINER
          </span>
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: '#ffd24a', letterSpacing: 1 }}>
            {TRAINER_NAME}
          </span>
        </div>
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: '#7af0c8', letterSpacing: 1 }}>
          {current?.team.name.toUpperCase() ?? ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: '#8e8ab8' }}>TEAM</span>
          <span style={{ fontFamily: "'Press Start 2P'", fontSize: 12, color: '#7af0c8' }}>
            {current?.members.length ?? 0}/6
          </span>
          <AdminBar token={token} onSetToken={setToken} />
        </div>
      </div>

      {/* ===== Team selector ===== */}
      {decorated.length > 0 && (
        <TeamSelector
          tabs={decorated.map((d) => d.tab)}
          active={safeIndex}
          onSelect={selectTeam}
          onPrev={() => cycle(-1)}
          onNext={() => cycle(1)}
          isAdmin={isAdmin}
          onAdd={() => setFormTarget('new')}
        />
      )}

      {/* ===== Owner actions for the current team ===== */}
      {isAdmin && current && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1080,
            margin: '0 auto 18px',
            display: 'flex',
            gap: 12,
          }}
        >
          <button type="button" style={ownerButton} onClick={() => setFormTarget(current.team)}>
            EDIT TEAM
          </button>
          <button
            type="button"
            style={{ ...ownerButton, color: '#f7625a', borderColor: '#5a2e3a' }}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'DELETING…' : 'DELETE TEAM'}
          </button>
        </div>
      )}

      {deleteMutation.isError && (
        <p style={{ maxWidth: 1080, margin: '0 auto 16px', color: '#f7625a', fontSize: 18, position: 'relative', zIndex: 1 }}>
          Delete failed: {deleteMutation.error.message}
        </p>
      )}

      {/* ===== States / grid ===== */}
      {isPending && <StatusLine>LOADING TEAMS…</StatusLine>}

      {isError && <StatusLine error>COULD NOT LOAD TEAMS: {error.message}</StatusLine>}

      {teams && decorated.length === 0 && (
        <StatusLine>
          NO TEAMS YET.{isAdmin ? ' USE “🔓 → + NEW” TO ADD ONE.' : ''}
        </StatusLine>
      )}

      {current && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1080,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 24,
          }}
        >
          {current.members.map((member, i) => (
            <MemberCard
              key={current.team.members[i].id}
              member={member}
              hovered={hovered === i}
              onEnter={() => setHovered(i)}
              onLeave={() => setHovered(-1)}
            />
          ))}
        </div>
      )}

      {/* ===== Bottom hint ===== */}
      {current && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 1080,
            margin: '30px auto 0',
            textAlign: 'center',
            fontFamily: "'Press Start 2P'",
            fontSize: 9,
            color: '#6a67a0',
            lineHeight: 1.8,
          }}
        >
          <span style={{ animation: 'blink 1.1s steps(1) infinite' }}>▸</span> HOVER A POKEMON TO
          INSPECT &nbsp;·&nbsp; ◀ ▶ SWITCH TEAM
        </div>
      )}

      {formTarget && (
        <TeamForm
          team={formTarget === 'new' ? null : formTarget}
          token={token}
          onClose={() => setFormTarget(null)}
        />
      )}
    </div>
  )
}

// A centered pixel status line for loading / error / empty states.
function StatusLine({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return (
    <p
      style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1080,
        margin: '40px auto',
        textAlign: 'center',
        fontFamily: "'Press Start 2P'",
        fontSize: 10,
        lineHeight: 1.8,
        color: error ? '#f7625a' : '#8e8ab8',
      }}
    >
      {children}
    </p>
  )
}

export default App
