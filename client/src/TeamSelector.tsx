// The team switcher above the grid: ◀ / ▶ arrows around a horizontally
// scrollable strip of team tabs. Each tab shows the team label and a row of six
// mini dots colored by each member's primary type — a quick at-a-glance preview.
// The active tab is lifted and outlined in gold.
//
// When the owner is in admin mode, a trailing "+ NEW" tab opens the create form.

export interface TeamTab {
  label: string
  dots: string[] // one color per member (primary-type color)
}

const arrowStyle: React.CSSProperties = {
  flex: '0 0 auto',
  width: 42,
  border: '3px solid #3a385c',
  background: '#14122a',
  color: '#bdb8ea',
  fontSize: 20,
  boxShadow: '0 0 0 3px #0b0b14',
  cursor: 'pointer',
}

export function TeamSelector({
  tabs,
  active,
  onSelect,
  onPrev,
  onNext,
  isAdmin,
  onAdd,
}: {
  tabs: TeamTab[]
  active: number
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
  isAdmin: boolean
  onAdd: () => void
}) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1080,
        margin: '0 auto 22px',
        display: 'flex',
        alignItems: 'stretch',
        gap: 10,
      }}
    >
      <button type="button" style={arrowStyle} onClick={onPrev} aria-label="Previous team">
        ◀
      </button>

      <div style={{ flex: 1, display: 'flex', gap: 10, overflowX: 'auto', padding: '3px 1px' }}>
        {tabs.map((tab, k) => {
          const isActive = k === active
          return (
            <button
              key={k}
              type="button"
              onClick={() => onSelect(k)}
              style={{
                flex: '0 0 auto',
                border: `3px solid ${isActive ? '#ffd24a' : '#3a385c'}`,
                background: isActive ? 'linear-gradient(180deg,#2a2746,#1c1936)' : '#14122a',
                boxShadow: `0 0 0 3px #0b0b14, ${
                  isActive ? '4px 7px 0 rgba(0,0,0,0.45)' : '4px 4px 0 rgba(0,0,0,0.4)'
                }`,
                transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'transform .1s ease',
                cursor: 'pointer',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: 9,
                  color: isActive ? '#ffd24a' : '#8e8ab8',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {tab.dots.map((color, i) => (
                  <span
                    key={i}
                    style={{ width: 10, height: 10, background: color, border: '1px solid #0b0b14' }}
                  />
                ))}
              </div>
            </button>
          )
        })}

        {isAdmin && (
          <button
            type="button"
            onClick={onAdd}
            style={{
              flex: '0 0 auto',
              border: '3px dashed #4b4870',
              background: '#14122a',
              boxShadow: '0 0 0 3px #0b0b14, 4px 4px 0 rgba(0,0,0,0.4)',
              cursor: 'pointer',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              fontFamily: "'Press Start 2P'",
              fontSize: 9,
              color: '#7af0c8',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}
          >
            + NEW
          </button>
        )}
      </div>

      <button type="button" style={arrowStyle} onClick={onNext} aria-label="Next team">
        ▶
      </button>
    </div>
  )
}
