import React from "react";

// Minimalist TripTally logo mark — a stylised "T" inside a rounded square
export default function AppLogo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TripTally"
    >
      {/* Rounded square bg */}
      <rect width="28" height="28" rx="7" fill="currentColor" />
      {/* Horizontal top bar of T */}
      <rect x="7" y="8" width="14" height="2.5" rx="1.25" fill="white" opacity="0.95" />
      {/* Vertical stem of T */}
      <rect x="12.25" y="10.5" width="3.5" height="9.5" rx="1.25" fill="white" opacity="0.95" />
      {/* Small tally tick — diagonal mark bottom-right */}
      <line x1="19.5" y1="17" x2="21.5" y2="21" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}