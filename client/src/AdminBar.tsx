import { useState } from 'react'

// Lets the owner paste their admin token to unlock write controls. The token is
// kept in App state + localStorage. Visitors who never enter one just see the
// read-only showcase — the token is never shipped or shown to them.
export function AdminBar({
  token,
  onSetToken,
}: {
  token: string
  onSetToken: (token: string) => void
}) {
  const [draft, setDraft] = useState('')

  if (token) {
    return (
      <div className="admin-bar">
        <span className="admin-bar__status">🔓 Owner mode</span>
        <button type="button" onClick={() => onSetToken('')}>
          Log out
        </button>
      </div>
    )
  }

  return (
    <form
      className="admin-bar"
      onSubmit={(e) => {
        e.preventDefault()
        if (draft.trim()) onSetToken(draft.trim())
      }}
    >
      <input
        type="password"
        placeholder="Admin token (owner only)"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button type="submit">Unlock</button>
    </form>
  )
}
