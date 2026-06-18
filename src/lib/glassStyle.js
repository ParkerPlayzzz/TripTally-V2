/**
 * Returns inline style for a liquid-glass panel.
 * opacity: 0.05 (clear) → 1.0 (solid)
 *
 * At low opacity: nearly invisible background, heavy blur → you see through it.
 * At high opacity: solid card background, no blur needed.
 */
export function glassStyle(opacity) {
  const isSolid = opacity >= 0.98;
  // Fill: nearly invisible at clear end, ramps up to full
  const fill = isSolid ? 1 : opacity * 0.25;
  // Blur: heavy when clear, tapers off as it becomes solid
  const blur = isSolid ? 0 : Math.round(40 - opacity * 36);

  return {
    backgroundColor: isSolid
      ? "hsl(var(--card))"
      : `hsl(var(--card) / ${fill})`,
    backdropFilter: isSolid ? "none" : `blur(${blur}px) saturate(160%)`,
    WebkitBackdropFilter: isSolid ? "none" : `blur(${blur}px) saturate(160%)`,
  };
}