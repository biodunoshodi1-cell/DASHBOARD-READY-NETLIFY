interface ShapeGlyphProps {
  /** Shape keyword, e.g. 'triangle', 'square', 'rectangle', 'circle',
   * 'pentagon', 'hexagon', 'cube', 'sphere'. Any other string (e.g. an
   * emoji from a different lesson's `image` field, like counting stars)
   * is rendered as plain text instead. */
  shape: string;
  className?: string;
}

const FILL = '#7c3aed';
const FILL_ALT = '#0ea5e9';

/**
 * Draws real, visually accurate shapes instead of relying on emoji, which
 * have two problems here: some (pentagon ⬠, hexagon ⬡) aren't proper emoji
 * and render as an invisible blank box on many devices, and others don't
 * actually match what they're meant to represent (the square emoji 🟦 was
 * previously reused for the rectangle question, showing a square instead
 * of an actual rectangle).
 */
export function ShapeGlyph({ shape, className }: ShapeGlyphProps) {
  const props = { className, viewBox: '0 0 100 100' };

  switch (shape) {
    case 'triangle':
      return (
        <svg {...props} aria-label="Triangle">
          <polygon points="50,8 94,88 6,88" fill={FILL} />
        </svg>
      );
    case 'square':
      return (
        <svg {...props} aria-label="Square">
          <rect x="10" y="10" width="80" height="80" fill={FILL} />
        </svg>
      );
    case 'rectangle':
      return (
        <svg {...props} aria-label="Rectangle">
          <rect x="4" y="24" width="92" height="52" fill={FILL_ALT} />
        </svg>
      );
    case 'circle':
      return (
        <svg {...props} aria-label="Circle">
          <circle cx="50" cy="50" r="44" fill={FILL} />
        </svg>
      );
    case 'pentagon':
      return (
        <svg {...props} aria-label="Pentagon">
          <polygon points="50,6 95,40 78,95 22,95 5,40" fill={FILL} />
        </svg>
      );
    case 'hexagon':
      return (
        <svg {...props} aria-label="Hexagon">
          <polygon points="25,6 75,6 98,50 75,94 25,94 2,50" fill={FILL_ALT} />
        </svg>
      );
    case 'cube':
      // Simple isometric cube: top face, left face, right face.
      return (
        <svg {...props} aria-label="Cube">
          <polygon points="50,6 90,26 50,46 10,26" fill="#a78bfa" />
          <polygon points="10,26 50,46 50,90 10,70" fill="#7c3aed" />
          <polygon points="90,26 50,46 50,90 90,70" fill="#6d28d9" />
        </svg>
      );
    case 'sphere':
      return (
        <svg {...props} aria-label="Sphere">
          <defs>
            <radialGradient id="sphereShade" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#6d28d9" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#sphereShade)" />
        </svg>
      );
    default:
      // Not a recognized shape keyword - fall back to rendering it as
      // plain text (used for other lessons' emoji `image` values, e.g.
      // counting questions' "⭐⭐⭐").
      return <span className={className}>{shape}</span>;
  }
}
