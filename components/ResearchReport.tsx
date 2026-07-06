'use client';

import React, { useState } from 'react';
import type { ResearchResult } from '@/lib/types';

export function ResearchReport({
  result,
  onSendDiscord,
}: {
  result: ResearchResult;
  onSendDiscord: (result: ResearchResult) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const { company, competitors, crawledPages } = result;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${company.name.replace(/[^a-z0-9]/gi, '_')}_research_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not generate the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Dossier header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-line">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-signal-amber font-mono mb-1">
            Target Profile
          </div>
          <h3 className="text-xl font-display font-semibold text-ink-primary">{company.name}</h3>
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="text-signal-cyan text-xs font-mono underline decoration-signal-cyan/30 underline-offset-2"
          >
            {company.website}
          </a>
        </div>
        <span className="shrink-0 mt-1 text-[10px] font-mono px-2 py-1 rounded-full border border-signal-cyan/30 text-signal-cyan bg-signal-cyan/5">
          SCAN COMPLETE
        </span>
      </div>

      {company.summary && <p className="text-ink-muted leading-relaxed">{company.summary}</p>}

      <div className="grid grid-cols-2 gap-3">
        <DataField label="Phone" value={company.phone || '— not found'} />
        <DataField label="Address" value={company.address || '— not found'} />
      </div>

      <Section label="Products / Services">
        {company.productsServices.length ? (
          <ul className="space-y-1.5">
            {company.productsServices.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-primary/90">
                <span className="text-signal-cyan mt-0.5">▸</span>
                {p}
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
      </Section>

      <Section label="AI-Generated Pain Points">
        {company.painPoints.length ? (
          <ul className="space-y-1.5">
            {company.painPoints.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-primary/90">
                <span className="text-signal-amber mt-0.5">◆</span>
                {p}
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
      </Section>

      <Section label={`Competitor Grid (${competitors.length})`}>
        {competitors.length ? (
          <div className="well rounded-lg overflow-hidden divide-y divide-line">
            {competitors.map((c, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 text-xs">
                <span className="font-medium text-ink-primary">{c.name}</span>
                <a
                  href={c.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-signal-cyan font-mono underline decoration-signal-cyan/30 underline-offset-2 truncate max-w-[160px]"
                >
                  {c.website}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </Section>

      {crawledPages.length > 0 && (
        <Section label={`Sources Crawled (${crawledPages.length})`}>
          <div className="flex flex-wrap gap-1.5">
            {crawledPages.map((p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono px-2 py-1 bg-signal-cyan/5 text-signal-cyan border border-signal-cyan/20 rounded-full hover:bg-signal-cyan/10 truncate max-w-[160px]"
                title={p.url}
              >
                {p.title || p.url}
              </a>
            ))}
          </div>
        </Section>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-3d flex-1 bg-signal-amber shadow-btn-amber active:shadow-btn-amber-pressed disabled:opacity-50 text-base-bg text-sm font-semibold px-4 py-2.5 rounded-xl focus-ring"
        >
          {downloading ? 'Preparing PDF…' : '⬇ Download PDF Report'}
        </button>
        <button
          onClick={() => onSendDiscord(result)}
          className="btn-3d flex-1 bg-transparent border border-signal-cyan/40 shadow-btn-cyan active:shadow-btn-cyan-pressed text-signal-cyan text-sm font-semibold px-4 py-2.5 rounded-xl focus-ring"
        >
          Send to Discord
        </button>
      </div>
    </div>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="well rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.1em] text-ink-faint font-mono">{label}</div>
      <div className="text-ink-primary text-sm mt-0.5 font-mono">{value}</div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink-faint mb-2">{label}</h4>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-ink-faint text-xs italic">No data available.</p>;
}
