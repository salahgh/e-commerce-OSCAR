import { ImageResponse } from 'next/og';

/**
 * Generates the app/PWA icon on the fly with next/og — no binary assets to
 * maintain. OSCAR Najar's mark is the brand initial in white on its matte-black
 * accent (#1E1E1E).
 */
const BG = '#1E1E1E';
const FG = '#FFFFFF';
const LETTER = 'O';

export function brandIcon(size: number, opts: { maskable?: boolean } = {}) {
  // Maskable icons must keep content inside the ~80% safe zone, so shrink the glyph.
  const fontSize = Math.round(size * (opts.maskable ? 0.42 : 0.56));
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: BG,
          color: FG,
          fontSize,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          fontFamily: 'serif',
        }}
      >
        {LETTER}
      </div>
    ),
    { width: size, height: size },
  );
}
