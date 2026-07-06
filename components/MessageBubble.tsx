'use client';

import React from 'react';
import { TiltCard } from './TiltCard';
import { RadarScan } from './RadarScan';

export function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end animate-fade-in">
      <div
        className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm font-body text-base-bg font-medium"
        style={{
          background: 'linear-gradient(135deg, #49E1D4, #2C8A83)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.25) inset, 0 8px 20px -10px rgba(73,225,212,0.5)',
        }}
      >
        {text}
      </div>
    </div>
  );
}

export function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start animate-fade-in">
      <TiltCard className="plaque max-w-[85%] rounded-bl-sm px-4 py-3.5 text-sm" maxTilt={2.5}>
        {children}
      </TiltCard>
    </div>
  );
}

export function TypingIndicator({ label, step, totalSteps }: { label: string; step: number; totalSteps: number }) {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="plaque max-w-[85%] px-4 py-3 rounded-bl-sm flex items-center gap-3">
        <RadarScan activeStep={step} totalSteps={totalSteps} />
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-signal-cyan font-mono mb-0.5">
            Scanning
          </div>
          <div className="text-xs text-ink-muted font-mono">{label}</div>
        </div>
      </div>
    </div>
  );
}
