import { useState } from 'react'
import type { CSSProperties } from 'react'

// Owner controls that live in the title bar's right zone. Visitors see only a
// small 🔒 button; clicking it reveals a token field. Once unlocked the owner
// sees their status and a log-out button. The token is held in App state +
// localStorage — it's never shipped to or shown to visitors.

const pillButton: CSSProperties = {
  fontFamily: "'Press Start 2P'",
  fontSize: 8,
  padding: '6px 9px',
  border: '2px solid #4b4870',
  background: '#14122a',
  color: '#bdb8ea',
  boxShadow: '0 0 0 2px #0b0b14',
  cursor: 'pointer',
  letterSpacing: '0.5px',
}

export function AdminBar({
  token,
  onSetToken,
}: {
  token: string
  onSetToken: (token: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  if (token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: '#7af0c8' }}>
          OWNER
        </span>
        <button type="button" style={pillButton} onClick={() => onSetToken('')}>
          LOG OUT
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        style={pillButton}
        onClick={() => setOpen(true)}
        aria-label="Owner login"
        title="Owner login"
      >
        🔒
      </button>
    )
  }

  return (
    <form
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      onSubmit={(e) => {
        e.preventDefault()
        if (draft.trim()) onSetToken(draft.trim())
      }}
    >
      <input
        type="password"
        autoFocus
        placeholder="Admin token"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 16,
          color: '#f5f3ff',
          background: '#14122a',
          border: '2px solid #3a385c',
          padding: '4px 8px',
          width: 150,
        }}
      />
      <button type="submit" style={pillButton}>
        UNLOCK
      </button>
    </form>
  )
}
