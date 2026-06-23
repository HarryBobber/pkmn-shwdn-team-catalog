import type { CSSProperties } from 'react'
import { typeColor, type ShowcaseMember } from './pokemon'

// One Pokémon in the 2×3 grid. At rest it shows a spinning-on-hover "crystal"
// placeholder (to be swapped for a real 3D model later), the name, type chips,
// and the tera line. On hover the card lifts/glows and an info panel fades in
// with item/ability/nature, moves, base-stat bars, EVs, IVs and BST.
//
// `hovered` is owned by the parent (only one card is open at a time), so this
// component is presentational: it reports enter/leave and renders accordingly.
//
// The card sets a `--type` CSS custom property to the member's accent color;
// the crystal faces, hover glow, and panel border all read from it via color-mix.

// One face of the faked 3-D cube. Each face is the same square, rotated/pushed
// out 45px and shaded with a per-face brightness so the gem reads as 3-D.
function Face({
  transform,
  brightness,
  tint = 52,
  border = 75,
  glow = 80,
}: {
  transform: string
  brightness: number
  tint?: number
  border?: number
  glow?: number | null
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `color-mix(in srgb, var(--type) ${tint}%, transparent)`,
        border: `1px solid color-mix(in srgb, var(--type) ${border}%, #fff)`,
        boxShadow:
          glow === null
            ? undefined
            : `inset 0 0 18px color-mix(in srgb, var(--type) ${glow}%, #fff)`,
        transform,
        filter: `brightness(${brightness})`,
      }}
    />
  )
}

function Crystal({ hovered }: { hovered: boolean }) {
  return (
    <div
      style={{
        height: 168,
        perspective: 680,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Blurred ground shadow that grounds the floating crystal. */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          width: 88,
          height: 16,
          borderRadius: '50%',
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--type) 70%, #000), transparent)',
          filter: 'blur(2px)',
          animation: 'shadowpulse 3.2s ease-in-out infinite',
        }}
      />
      {/* bob wrapper → tilt wrapper → spinner → 6 faces */}
      <div style={{ animation: 'bob 3.2s ease-in-out infinite', transformStyle: 'preserve-3d' }}>
        <div
          style={{
            transform: hovered ? 'rotateX(-16deg) scale(1.07)' : 'rotateX(-16deg) scale(1)',
            transformStyle: 'preserve-3d',
            transition: 'transform .15s ease',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 90,
              height: 90,
              transformStyle: 'preserve-3d',
              transform: 'scaleY(1.22)',
              animation: 'spin 4.6s linear infinite',
              // Spin only while hovered — idle crystals sit still.
              animationPlayState: hovered ? 'running' : 'paused',
            }}
          >
            <Face transform="translateZ(45px)" brightness={1.05} />
            <Face transform="rotateY(180deg) translateZ(45px)" brightness={0.8} />
            <Face transform="rotateY(90deg) translateZ(45px)" brightness={0.92} />
            <Face transform="rotateY(-90deg) translateZ(45px)" brightness={0.92} />
            <Face
              transform="rotateX(90deg) translateZ(45px)"
              brightness={1.35}
              tint={60}
              border={80}
              glow={90}
            />
            <Face
              transform="rotateX(-90deg) translateZ(45px)"
              brightness={0.6}
              tint={45}
              border={65}
              glow={null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function MemberCard({
  member,
  hovered,
  onEnter,
  onLeave,
}: {
  member: ShowcaseMember
  hovered: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const accent = member.accent

  // The card root sets --type so descendants can color-mix against it. The cast
  // is because React's CSSProperties type doesn't know about custom properties.
  const cardStyle = {
    '--type': accent,
    position: 'relative',
    border: '3px solid #3a385c',
    background: 'linear-gradient(180deg, rgba(25,23,48,0.93), rgba(18,16,36,0.93))',
    padding: '18px 16px 16px',
    cursor: 'pointer',
    transition: 'transform .12s ease, box-shadow .12s ease',
    transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
    // Raise the hovered card so its overflowing panel renders above neighbors.
    zIndex: hovered ? 100 : 1,
    boxShadow: hovered
      ? `0 0 0 3px ${accent}, 5px 11px 0 rgba(0,0,0,0.45), 0 0 28px color-mix(in srgb, ${accent} 55%, transparent)`
      : '0 0 0 3px #0b0b14, 5px 5px 0 rgba(0,0,0,0.45)',
  } as CSSProperties

  return (
    <div style={cardStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Crystal hovered={hovered} />

      {/* Name + type chips + tera line */}
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <div
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: 12,
            color: '#f5f3ff',
            lineHeight: 1.5,
            textShadow: '2px 2px 0 #000',
          }}
        >
          {member.name}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 9 }}>
          {member.types.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "'Press Start 2P'",
                fontSize: 8,
                color: '#0b0b14',
                // Chips always use the true type color (the accent override only
                // affects the card glow / crystal tint).
                background: typeColor(t),
                border: '2px solid #0b0b14',
                padding: '4px 7px',
                letterSpacing: '0.5px',
              }}
            >
              {t.toUpperCase()}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 9, fontSize: 18, color: '#8e8ab8', letterSpacing: '0.5px' }}>
          TERA{' '}
          {member.tera ? (
            <span style={{ color: member.teraColor }}>◆ {member.tera}</span>
          ) : (
            <span>◆ —</span>
          )}
        </div>
      </div>

      <HoverPanel member={member} hovered={hovered} accent={accent} />
    </div>
  )
}

function HoverPanel({
  member,
  hovered,
  accent,
}: {
  member: ShowcaseMember
  hovered: boolean
  accent: string
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 120,
        width: 330,
        zIndex: 60,
        pointerEvents: 'none',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(14px)',
        transition: 'opacity .16s ease, transform .16s ease',
        border: `3px solid ${accent}`,
        background: 'rgba(12,11,24,0.88)',
        backdropFilter: 'blur(3px)',
        boxShadow: `0 0 0 3px #0b0b14, 6px 6px 0 rgba(0,0,0,0.55), 0 0 30px color-mix(in srgb, ${accent} 50%, transparent)`,
        padding: '14px 14px 15px',
      }}
    >
      {/* Header: name + tera */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #34325a',
          paddingBottom: 8,
          marginBottom: 9,
        }}
      >
        <span style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: '#f5f3ff' }}>
          {member.name}
        </span>
        {member.tera && (
          <span style={{ fontSize: 18, color: member.teraColor }}>◆{member.tera}</span>
        )}
      </div>

      {/* Meta rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          fontSize: 18,
          lineHeight: 1.25,
          marginBottom: 10,
        }}
      >
        <MetaRow label="ITEM" value={member.item} color="#ffe08a" />
        <MetaRow label="ABILITY" value={member.ability} color="#9fe8ff" />
        <MetaRow label="NATURE" value={member.nature} color="#f5a3d0" />
      </div>

      {/* Moves: 2×2 grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 5,
          marginBottom: 11,
        }}
      >
        {member.moves.map((mv, i) => (
          <span
            key={`${mv}-${i}`}
            style={{
              fontSize: 16,
              color: '#e6e4ff',
              background: '#1c1a36',
              border: '2px solid #34325a',
              borderLeft: `4px solid ${accent}`,
              padding: '4px 7px',
              lineHeight: 1.15,
            }}
          >
            {mv}
          </span>
        ))}
      </div>

      {/* Stat bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {member.stats.map((st) => (
          <div key={st.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{ width: 30, fontFamily: "'Press Start 2P'", fontSize: 7, color: '#9794c2' }}
            >
              {st.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 9,
                background: '#1c1a36',
                border: '1px solid #34325a',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '100%', width: `${st.pct}%`, background: st.color }} />
            </div>
            <span style={{ width: 26, textAlign: 'right', fontSize: 16, color: '#e6e4ff' }}>
              {st.value}
            </span>
            <span style={{ width: 34, textAlign: 'right', fontSize: 14, color: '#6f6c98' }}>
              {st.evLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Footer: IVs + BST */}
      <div
        style={{
          marginTop: 8,
          fontSize: 14,
          color: '#6f6c98',
          letterSpacing: '0.5px',
          borderTop: '2px solid #34325a',
          paddingTop: 7,
        }}
      >
        IVs {member.ivLabel} · BST {member.bst}
      </div>
    </div>
  )
}

function MetaRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#7d7aa6' }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  )
}
