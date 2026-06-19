import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTeam, updateTeam, type Team, type TeamInput } from './api'

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
    <form className="team-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? `Edit "${team.name}"` : 'New team'}</h2>

      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <div className="team-form__row">
        <label>
          Generation
          <select
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

        <label>
          Format (optional)
          <input
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            placeholder="gen9ou"
          />
        </label>
      </div>

      <label>
        Notes (optional)
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <label>
        Showdown paste
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={12}
          placeholder="Paste your team from Pokémon Showdown here…"
          required
        />
      </label>

      {mutation.isError && (
        <p className="status--error">{mutation.error.message}</p>
      )}

      <div className="team-form__actions">
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </button>
      </div>
    </form>
  )
}
