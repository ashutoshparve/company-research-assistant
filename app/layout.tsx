import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scope — AI Company Research Console',
  description: 'Research any company with AI-powered insights, competitor analysis, and PDF reports.',
  keywords: ['company research', 'AI', 'competitor analysis', 'OpenRouter', 'Serper'],
  openGraph: {
    title: 'Scope — AI Company Research Console',
    description: 'Scan any company\'s public footprint, surface competitors, and compile a downloadable dossier.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-base-bg text-ink-primary font-body antialiased">{children}</body>
    </html>
  );
}
