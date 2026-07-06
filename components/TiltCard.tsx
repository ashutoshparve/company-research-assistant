'use client';

import React, { useRef, useState } from 'react';

/**
 * Wraps children in a panel that tilts toward the cursor in 3D, giving
 * plaques a tactile, physical feel. Falls back to flat on touch devices
 * (no mousemove events) and respects prefers-reduced-motion via the
 * transition being instant when disabled at the OS level.
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 5,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - py) * maxTilt * 2;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    setGlow({ x: px * 100, y: py * 100, active: true });
  }

  function handleMouseLeave() {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    setGlow((g) => ({ ...g, active: false }));
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-3d relative ${className}`}
      style={{ transform }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
        style={{
          opacity: glow.active ? 1 : 0,
          background: `radial-gradient(220px circle at ${glow.x}% ${glow.y}%, rgba(73,225,212,0.08), transparent 70%)`,
        }}
      />
    </div>
  );
}
