interface CountableDisplayProps {
  /** Individual objects to count, rendered as a wrapped grid of same-size icons. */
  countItems?: string[];
  /** Fallback for non-grid images: either a short decorative single emoji
   * (fractions/money/word-problem questions), or a number-sequence pattern
   * like "1 2 3 4 5 ?" (rendered as spaced number tiles, not one giant
   * unbroken text string). */
  image?: string;
  className?: string;
}

/** A string of space-separated short tokens (digits, "?", etc.) - the
 * "count to 10" / "what comes next" style questions, as opposed to a
 * single decorative emoji. */
function isSequencePattern(image: string): boolean {
  const tokens = image.trim().split(/\s+/);
  return tokens.length > 1 && tokens.every((t) => /^[\d?]+$/.test(t));
}

export function CountableDisplay({ countItems, image, className }: CountableDisplayProps) {
  if (countItems && countItems.length > 0) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto ${className ?? ''}`}>
        {countItems.map((item, i) => (
          <span key={i} className="text-4xl sm:text-5xl leading-none">
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (image && isSequencePattern(image)) {
    const tokens = image.trim().split(/\s+/);
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 ${className ?? ''}`}>
        {tokens.map((token, i) => (
          <span
            key={i}
            className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-2xl sm:text-3xl font-black ${
              token === '?'
                ? 'border-2 border-dashed border-purple-400 text-purple-500'
                : 'bg-purple-100 dark:bg-purple-900/30 text-foreground'
            }`}
          >
            {token}
          </span>
        ))}
      </div>
    );
  }

  if (image) {
    return <div className={`text-6xl text-center ${className ?? ''}`}>{image}</div>;
  }

  return null;
}
