import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#0A0E13',
          panel: '#12181F',
          sunken: '#0D1319',
          raised: '#161D25',
        },
        signal: {
          cyan: '#49E1D4',
          'cyan-dim': '#2C8A83',
          amber: '#F0A83C',
          'amber-dim': '#8C6321',
          red: '#F2555A',
        },
        ink: {
          primary: '#E9EEF3',
          muted: '#8492A0',
          faint: '#4C5A68',
        },
        line: {
          DEFAULT: '#212B34',
          bright: '#2E3A45',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        plaque: '0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 28px -14px rgba(0,0,0,0.7), 0 2px 5px rgba(0,0,0,0.45)',
        well: 'inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 0 rgba(255,255,255,0.02)',
        'btn-amber': '0 4px 0 #8C6321, 0 10px 20px -8px rgba(240,168,60,0.45)',
        'btn-amber-pressed': '0 1px 0 #8C6321, 0 3px 8px -4px rgba(240,168,60,0.35)',
        'btn-cyan': '0 4px 0 #1D6B65, 0 10px 20px -8px rgba(73,225,212,0.35)',
        'btn-cyan-pressed': '0 1px 0 #1D6B65, 0 3px 8px -4px rgba(73,225,212,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
