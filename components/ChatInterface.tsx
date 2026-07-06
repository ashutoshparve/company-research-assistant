'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UserBubble, AssistantBubble, TypingIndicator } from './MessageBubble';
import { ResearchReport } from './ResearchReport';
import { DiscordSettingsModal, DiscordConfig } from './DiscordSettings';
import type { ResearchResult } from '@/lib/types';
import { SUPPORTED_MODELS } from '@/lib/openrouter';

type Message =
  | { id: string; role: 'user'; type: 'text'; text: string }
  | { id: string; role: 'assistant'; type: 'text'; text: string }
  | { id: string; role: 'assistant'; type: 'report'; result: ResearchResult };

const PROGRESS_STEPS = [
  'Locating official website…',
  'Crawling About / Products / Contact…',
  'Cross-referencing public sources…',
  'Running AI analysis…',
  'Mapping competitor landscape…',
  'Compiling dossier…',
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      type: 'text',
      text:
        "Console online. Give me a company name (e.g. \"Stripe\") or a website URL and I'll scan its public footprint, surface competitors, and compile a downloadable dossier.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [model, setModel] = useState(SUPPORTED_MODELS[0].id);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [pendingDiscordResult, setPendingDiscordResult] = useState<ResearchResult | null>(null);
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig>({
    botToken: '',
    channelId: '',
    applicantName: '',
    applicantEmail: '',
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;
    setProgressStep(0);
    const interval = setInterval(() => {
      setProgressStep((s) => Math.min(s + 1, PROGRESS_STEPS.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', type: 'text', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed, model }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: 'assistant', type: 'text', text: `⚠ ${data.error || 'Something went wrong.'}` },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: 'assistant', type: 'report', result: data as ResearchResult },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', type: 'text', text: '⚠ Network error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openDiscordFlow(result: ResearchResult) {
    setPendingDiscordResult(result);
    setShowDiscordModal(true);
  }

  async function handleSaveDiscordConfig(config: DiscordConfig) {
    setDiscordConfig(config);
    setShowDiscordModal(false);
    if (!pendingDiscordResult) return;

    try {
      const res = await fetch('/api/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: config.botToken,
          channelId: config.channelId,
          applicantName: config.applicantName,
          applicantEmail: config.applicantEmail,
          result: pendingDiscordResult,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          type: 'text',
          text: res.ok
            ? '✓ Dossier relayed to your configured Discord channel.'
            : `⚠ Could not send to Discord: ${data.error}`,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', type: 'text', text: '⚠ Network error sending to Discord.' },
      ]);
    } finally {
      setPendingDiscordResult(null);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Console header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-line bg-base-panel/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <h1 className="text-sm font-display font-semibold tracking-wide text-ink-primary">SCOPE</h1>
            <p className="text-[10px] font-mono text-ink-faint uppercase tracking-[0.1em]">
              Company Research Console
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="text-[11px] font-mono well rounded-lg px-2.5 py-1.5 text-ink-muted focus-ring appearance-none cursor-pointer"
          >
            {SUPPORTED_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-base-panel">
                {m.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setPendingDiscordResult(null);
              setShowDiscordModal(true);
            }}
            className="btn-3d text-[11px] font-mono bg-base-raised border border-line text-ink-muted hover:text-signal-cyan px-3 py-1.5 rounded-lg focus-ring"
          >
            ⚙ Discord
          </button>
        </div>
      </header>

      {/* Scan well */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 well">
        {messages.map((msg) => {
          if (msg.role === 'user') return <UserBubble key={msg.id} text={msg.text} />;
          if (msg.type === 'text') return <AssistantBubble key={msg.id}>{msg.text}</AssistantBubble>;
          return (
            <AssistantBubble key={msg.id}>
              <ResearchReport result={msg.result} onSendDiscord={openDiscordFlow} />
            </AssistantBubble>
          );
        })}
        {loading && (
          <TypingIndicator
            label={PROGRESS_STEPS[progressStep]}
            step={progressStep}
            totalSteps={PROGRESS_STEPS.length}
          />
        )}
      </div>

      {/* Input console */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-5 py-4 border-t border-line bg-base-panel/60 backdrop-blur-sm">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a company name or website URL…"
          disabled={loading}
          className="flex-1 well rounded-full px-4 py-2.5 text-sm font-mono text-ink-primary placeholder:text-ink-faint focus-ring disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-3d bg-signal-amber shadow-btn-amber active:shadow-btn-amber-pressed disabled:opacity-40 text-base-bg text-sm font-semibold px-5 py-2.5 rounded-full focus-ring"
        >
          Scan
        </button>
      </form>

      {showDiscordModal && (
        <DiscordSettingsModal
          initial={discordConfig}
          onClose={() => setShowDiscordModal(false)}
          onSave={handleSaveDiscordConfig}
        />
      )}
    </div>
  );
}

function BrandMark() {
  return (
    <div className="w-9 h-9 rounded-lg well flex items-center justify-center relative overflow-hidden">
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8.5" fill="none" stroke="#1D6B65" strokeWidth="1" />
        <circle cx="10" cy="10" r="5" fill="none" stroke="#1D6B65" strokeWidth="1" />
        <circle cx="10" cy="10" r="1.6" fill="#49E1D4" />
        <line x1="10" y1="10" x2="10" y2="2" stroke="#49E1D4" strokeWidth="1.2" className="animate-sweep" style={{ transformOrigin: '10px 10px' }} />
      </svg>
    </div>
  );
}
