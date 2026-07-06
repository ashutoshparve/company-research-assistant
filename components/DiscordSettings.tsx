'use client';

import React, { useState } from 'react';
import { TiltCard } from './TiltCard';

export interface DiscordConfig {
  botToken: string;
  channelId: string;
  applicantName: string;
  applicantEmail: string;
}

export function DiscordSettingsModal({
  initial,
  onClose,
  onSave,
}: {
  initial: DiscordConfig;
  onClose: () => void;
  onSave: (config: DiscordConfig) => void;
}) {
  const [config, setConfig] = useState<DiscordConfig>(initial);

  function update<K extends keyof DiscordConfig>(key: K, value: DiscordConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <TiltCard maxTilt={1.5} className="plaque w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-signal-amber font-mono mb-1">
              Automation Channel
            </div>
            <h2 className="text-lg font-display font-semibold text-ink-primary">Discord Integration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink-primary text-xl leading-none focus-ring rounded"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Once configured, every generated report is relayed to this channel with your applicant
          details and the PDF attached.
        </p>

        <Field label="Discord Bot Token">
          <input
            type="password"
            className="field"
            value={config.botToken}
            onChange={(e) => update('botToken', e.target.value)}
            placeholder="Bot token"
          />
        </Field>
        <Field label="Discord Channel ID">
          <input
            type="text"
            className="field"
            value={config.channelId}
            onChange={(e) => update('channelId', e.target.value)}
            placeholder="1234567890"
          />
        </Field>
        <Field label="Applicant Name">
          <input
            type="text"
            className="field"
            value={config.applicantName}
            onChange={(e) => update('applicantName', e.target.value)}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Applicant Email">
          <input
            type="email"
            className="field"
            value={config.applicantEmail}
            onChange={(e) => update('applicantEmail', e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="btn-3d flex-1 bg-base-raised border border-line text-ink-muted text-sm font-medium px-4 py-2.5 rounded-xl focus-ring"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(config)}
            className="btn-3d flex-1 bg-signal-amber shadow-btn-amber active:shadow-btn-amber-pressed text-base-bg text-sm font-semibold px-4 py-2.5 rounded-xl focus-ring"
          >
            Save Configuration
          </button>
        </div>

        <style jsx>{`
          :global(.field) {
            width: 100%;
            background: #0d1319;
            border: 1px solid #212b34;
            box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.55);
            border-radius: 0.6rem;
            padding: 0.55rem 0.8rem;
            font-size: 0.8rem;
            font-family: 'IBM Plex Mono', ui-monospace, monospace;
            color: #e9eef3;
            outline: none;
            transition: border-color 120ms ease;
          }
          :global(.field::placeholder) {
            color: #4c5a68;
          }
          :global(.field:focus) {
            border-color: #49e1d4;
          }
        `}</style>
      </TiltCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-faint">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
