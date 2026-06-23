// The Gen-5-style pixel battle backdrop: a fixed, full-screen layer behind the
// whole app (night sky, twinkling stars, glowing horizon, a battle platform, and
// a receding perspective grid floor). Pure CSS — no image assets. The values are
// taken verbatim from the design handoff.
//
// `scanlines` toggles a faint CRT overlay drawn on top of everything (z-index 200).

export function Backdrop({ scanlines = true }: { scanlines?: boolean }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          background:
            'linear-gradient(180deg,#0a0a1c 0%,#16133a 38%,#241a52 53%,#3a2360 57%,#1d1430 78%,#120d22 100%)',
        }}
      >
        {/* Star field: a single element with a long box-shadow list of dots. */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '10%',
            width: 2,
            height: 2,
            background: '#fff',
            boxShadow:
              '60px 20px #fff,160px 60px #c9c2ff,260px 12px #fff,360px 70px #fff,470px 30px #b9b0ff,560px 90px #fff,680px 24px #fff,780px 64px #c9c2ff,900px 18px #fff,1010px 80px #fff,120px 110px #fff,420px 120px #b9b0ff,720px 130px #fff,980px 116px #c9c2ff',
            animation: 'twinkle 3.4s steps(2) infinite',
          }}
        />
        {/* Horizon glow line. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '56.5%',
            height: 2,
            background: '#7a5bff',
            boxShadow: '0 0 20px 4px rgba(122,91,255,0.55)',
          }}
        />
        {/* Battle platform ellipse near the horizon. */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '53%',
            width: 420,
            height: 60,
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            border: '3px solid rgba(140,110,255,0.30)',
            background:
              'radial-gradient(closest-side, rgba(90,70,200,0.18), transparent)',
          }}
        />
        {/* Perspective grid floor: two repeating gradients tilted into the distance. */}
        <div
          style={{
            position: 'absolute',
            left: '-30%',
            right: '-30%',
            bottom: 0,
            height: '44%',
            transform: 'perspective(440px) rotateX(66deg)',
            transformOrigin: 'bottom center',
            backgroundColor: '#0c0920',
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0, transparent 46px, rgba(124,98,235,0.45) 46px, rgba(124,98,235,0.45) 48px), repeating-linear-gradient(0deg, transparent 0, transparent 46px, rgba(124,98,235,0.30) 46px, rgba(124,98,235,0.30) 48px)',
            animation: 'drift 6s linear infinite',
            boxShadow: 'inset 0 60px 80px rgba(8,6,20,0.7)',
          }}
        />
        {/* Vignette. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(6,6,14,0.65) 100%)',
          }}
        />
      </div>

      {scanlines && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            pointerEvents: 'none',
            background:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.20) 0px, rgba(0,0,0,0.20) 1px, transparent 2px, transparent 3px)',
            mixBlendMode: 'multiply',
          }}
        />
      )}
    </>
  )
}
