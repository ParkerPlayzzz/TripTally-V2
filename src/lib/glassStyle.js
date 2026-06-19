/**
 * Returns inline style for a liquid-glass panel.
 * opacity: 0.05 (clear) → 1.0 (solid)
 *
 * At low opacity: nearly invisible background, heavy blur → you see through it.
 * At high opacity: solid card background, no blur needed.
 */
export function glassStyle(opacity) {
  const isSolid = opacity >= 0.98;
  // Fill: make visible transparency changes across the range
  const fill = isSolid ? 1 : Math.min(1, Math.max(0.08, opacity * 0.75 + 0.12));
  // Blur: stronger effect at low opacity, softer as it becomes solid
  const blur = isSolid ? 0 : Math.round(42 - opacity * 38);

  return {
    backgroundColor: isSolid
      ? "hsl(var(--card))"
      : `hsl(var(--card) / ${fill})`,
    border: isSolid ? "1px solid transparent" : `1px solid rgba(255,255,255,${Math.min(0.24, fill)})`,
    backdropFilter: isSolid ? "none" : `blur(${blur}px) saturate(180%)`,
    WebkitBackdropFilter: isSolid ? "none" : `blur(${blur}px) saturate(180%)`,
  };
}