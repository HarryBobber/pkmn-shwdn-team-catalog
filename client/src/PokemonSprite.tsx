import { useState } from 'react'
import { Sprites, Icons } from '@pkmn/img'

// Phase 4, step 1: a 2D sprite for a single Pokémon species. This is a deliberate
// *placeholder* — later phases swap it for real 3D models, but we build the
// data → image mapping against cheap 2D sprites first.
//
// We don't keep our own image list. `@pkmn/img` turns a species name (the same
// string we stored from the Showdown paste) into a Pokémon Showdown sprite URL.
//
// Coverage gotcha: Showdown's full-sprite sets don't include every newer species
// (e.g. Iron Crown has no full sprite anywhere). So if the <img> fails to load,
// we fall back to the Pokémon *icon*, which is one shared sprite sheet that does
// cover every species — guaranteeing we never show a broken-image glyph.
export function PokemonSprite({ species }: { species: string }) {
  const [spriteFailed, setSpriteFailed] = useState(false)

  // Fallback: the icon is a 40×30 window onto a shared sprite sheet, positioned
  // with CSS. `.css` is already a React-ready (camelCased) style object; it's
  // typed loosely by the library, so we assert it back to CSSProperties.
  if (spriteFailed) {
    const icon = Icons.getPokemon(species)
    return (
      <span
        className="sprite sprite--icon"
        style={icon.css as React.CSSProperties}
        role="img"
        aria-label={species}
      />
    )
  }

  // Primary: a full static sprite. The `gen5` set is the most complete and
  // visually uniform full-sprite set, so a whole team looks consistent.
  const sprite = Sprites.getPokemon(species, { gen: 'gen5' })
  return (
    <img
      className="sprite"
      src={sprite.url}
      alt={species}
      width={sprite.w}
      height={sprite.h}
      loading="lazy"
      style={{ imageRendering: sprite.pixelated ? 'pixelated' : 'auto' }}
      onError={() => setSpriteFailed(true)}
    />
  )
}
