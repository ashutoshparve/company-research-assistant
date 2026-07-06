'use client';

import React from 'react';

/**
 * The app's signature visual: a radar sweep that "pings" the crawl steps as
 * they complete. Ties the loading state directly to what the app is actually
 * doing (scanning a company's public footprint) instead of a generic spinner.
 */
export function RadarScan({ activeStep, totalSteps }: { activeStep: number; totalSteps: number }) {
  const size = 44;
  const center = size / 2;
  const rings = [center * 0.35, center * 0.62, center * 0.9];

  const blips = Array.from({ length: totalSteps }).map((_, i) => {
    const angle = (i / totalSteps) * Math.PI * 2 - Math.PI / 2;
    const radius = center * 0.62;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      lit: i <= activeStep,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={center} cy={center} r={rings[2]} fill="#0D1319" stroke="#212B34" strokeWidth="1" />
      {rings.map((r, i) => (
        <circle key={i} cx={center} cy={center} r={r} fill="none" stroke="#1D6B65" strokeWidth="0.75" opacity={0.5} />
      ))}
      <g className="animate-sweep" style={{ transformOrigin: `${center}px ${center}px` }}>
        <path
          d={`M ${center} ${center} L ${center} ${center - rings[2]} A ${rings[2]} ${rings[2]} 0 0 1 ${
            center + rings[2] * Math.sin(Math.PI / 3)
          } ${center - rings[2] * Math.cos(Math.PI / 3)} Z`}
          fill="url(#sweepGradient)"
          opacity={0.55}
        />
      </g>
      <defs>
        <radialGradient id="sweepGradient">
          <stop offset="0%" stopColor="#49E1D4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#49E1D4" stopOpacity="0" />
        </radialGradient>
      </defs>
      {blips.map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={b.lit ? 2.2 : 1.4}
          fill={b.lit ? '#F0A83C' : '#4C5A68'}
          className={b.lit ? 'animate-blip' : ''}
        />
      ))}
    </svg>
  );
}
