import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTeam, updateTeam, type Team, type TeamInput } from './api'

// Shared pixel-theme styles for the form's fields.
const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontFamily: "'Press Start 2P'",
  fontSize: 9,
  color: '#8e8ab8',
  letterSpacing: '0.5px',
}

const fieldStyle: CSSProperties = {
  fontFamily: "'VT323', monospace",
  fontSize: 18,
  color: '#f5f3ff',
  background: '#14122a',
  border: '2px solid #3a385c',
  padding: '6px 9px',
}

const buttonStyle: CSSProperties = {
  fontFamily: "'Press Start 2P'",
  fontSize: 10,
  padding: '10px 16px',
  border: '3px solid #4b4870',
  background: '#1c1936',
  color: '#7af0c8',
  boxShadow: '0 0 0 3px #0b0b14, 4px 4px 0 rgba(0,0,0,0.45)',
  cursor: 'pointer',
}

// Create/edit form. Pass `team` to edit an existing one, or null to create a new
// one. The textarea holds the Showdown paste — the server parses it into rows.
export function TeamForm({
  team,
  token,
  onClose,
}: {
  team: Team | null
  token: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const isEdit = team !== null

  // Pre-fill from the existing team when editing. The paste comes from the saved
  // rawPaste (every team created through this app stores it).
  const [name, setName] = useState(team?.name ?? '')
  const [generation, setGeneration] = useState(String(team?.generation ?? 9))
  const [format, setFormat] = useState(team?.format ?? '')
  const [notes, setNotes] = useState(team?.notes ?? '')
  const [paste, setPaste] = useState(team?.rawPaste ?? '')

  const mutation = useMutation({
    mutationFn: (input: TeamInput) =>
      isEdit ? updateTeam(team.id, input, token) : createTeam(input, token),
    onSuccess: () => {
      // Refetch the team list so the new/edited team shows immediately.
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      onClose()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({
      name,
      generation: Number(generation),
      format,
      notes,
      paste,
    })
  }

  return (
    // Dimmed overlay (z-index above the showcase, below the scanlines) with a
    // centered pixel panel. Clicking the backdrop closes the form.
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(6,6,14,0.75)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          border: '3px solid #4b4870',
          background: 'linear-gradient(180deg,#23213a,#16142a)',
          boxShadow: '0 0 0 3px #0b0b14, 6px 6px 0 rgba(0,0,0,0.5)',
          padding: '22px 22px 24px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "'Press Start 2P'",
            fontSize: 13,
            color: '#ffd24a',
            letterSpacing: '1px',
            lineHeight: 1.5,
          }}
        >
          {isEdit ? `EDIT ${team.name.toUpperCase()}` : 'NEW TEAM'}
        </h2>

        <label style={labelStyle}>
          NAME
          <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <div style={{ display: 'flex', gap: 16 }}>
          <label style={{ ...labelStyle, flex: 1 }}>
            GENERATION
            <select
              style={fieldStyle}
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
            >
              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((g) => (
                <option key={g} value={g}>
                  Gen {g}
                </option>
              ))}
            </select>
          </label>

          <label style={{ ...labelStyle, flex: 1 }}>
            FORMAT (OPTIONAL)
            <input
              style={fieldStyle}
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="gen9ou"
            />
          </label>
        </div>

        <label style={labelStyle}>
          NOTES (OPTIONAL)
          <input style={fieldStyle} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <label style={labelStyle}>
          SHOWDOWN PASTE
          <textarea
            style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.3 }}
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={12}
            placeholder="Paste your team from Pokémon Showdown here…"
            required
          />
        </label>

        {mutation.isError && (
          <p style={{ margin: 0, color: '#f7625a', fontSize: 18 }}>{mutation.error.message}</p>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" style={buttonStyle} disabled={mutation.isPending}>
            {mutation.isPending ? 'SAVING…' : 'SAVE'}
          </button>
          <button
            type="button"
            style={{ ...buttonStyle, color: '#bdb8ea' }}
            onClick={onClose}
            disabled={mutation.isPending}
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  )
}
