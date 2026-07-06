# Scope — AI Company Research Console

> An AI-powered company research assistant that scans any company's public
> footprint, surfaces competitors, and compiles a downloadable dossier — all
> from a single company name or website URL.

Built for the **Relu Consultancy AI & Automation Developer** hiring hackathon.

<p align="left">
  <img alt="Next.js 14" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-lightgrey">
</p>

---

## Live Demo

- **Deployed app:** `<add your Vercel/Netlify URL here>`
- **Demo video / screenshots:** `<optional — add a link or embed below>`

## What It Does

Give Scope a company name (e.g. `Stripe`) or a website URL, and it will:

1. Find the company's official website (if you only gave a name).
2. Crawl its key pages — Home, About, Products, Services, Solutions, Contact,
   Pricing — while skipping login pages, duplicates, and irrelevant links.
3. Cross-reference public search results for contact details and competitor
   signals.
4. Run the combined content through an AI model of your choice (via
   OpenRouter) to produce a company summary, products/services, AI-generated
   pain points, and a competitor list.
5. Render the result as an interactive dossier in a ChatGPT-style console.
6. Let you download a polished PDF report in one click, or relay the whole
   thing — applicant details, company info, and the PDF — straight to a
   Discord channel.

---

## Features

| Category | What's implemented |
|---|---|
| **Dual input** | Accepts a company name *or* a website URL in the same input field. |
| **Website crawler** | Same-domain link discovery, keyword-ranked page priority, dedupe by normalized path, login/irrelevant-page filtering, content extraction via `cheerio`. |
| **Search integration** | Serper.dev for official-website discovery, contact info, and competitor hints. |
| **AI integration** | OpenRouter, model-agnostic — pick any supported model from the header dropdown. Strict JSON-mode prompting for structured output. |
| **Competitor analysis** | 3–8 competitors per report, each with name + official website. |
| **PDF report** | Single-click download, generated server-side with `@react-pdf/renderer` (no headless browser required — deploys cleanly on serverless). |
| **Chat interface** | Conversational input/output, live progress indicator tied to actual pipeline steps (not a generic spinner). |
| **Discord integration (bonus)** | In-app settings modal for Bot Token + Channel ID; auto-posts applicant name/email, company name/website, and the PDF attachment after each report. |
| **UI/UX** | Custom "signal-intelligence console" design system — see [Design](#design) below. |

---

## Design

The interface (codename **Scope**) is built around the app's actual job:
scanning a company's public footprint. Rather than a generic chat template:

- **Palette** — dark graphite-navy base (`#0A0E13`) with two working accents:
  cyan (`#49E1D4`) for data and scan-state, amber (`#F0A83C`) for primary
  actions. A faint grid texture reinforces the console feel.
- **Type** — Space Grotesk for headings, Inter for body copy, IBM Plex Mono
  for every data field (phone, address, website, model name) — the mono
  treatment is what makes reports read like a dossier rather than a form.
- **Signature element** — a radar sweep replaces the loading spinner. Its
  blips light up in sync with the real pipeline steps (site discovery →
  crawl → cross-reference → AI analysis → competitor mapping → compile).
- **Interaction** — panels tilt in 3D toward the cursor with a soft glow
  (mouse-tracked, disabled gracefully on touch devices), and buttons are
  physically extruded with a visible press state.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + custom design tokens
- **Crawling:** `cheerio` (lightweight, no headless browser)
- **Search:** [Serper.dev](https://serper.dev) REST API
- **AI:** [OpenRouter](https://openrouter.ai) Chat Completions API (model-agnostic)
- **PDF:** `@react-pdf/renderer`
- **Deployment:** Vercel (or any Node-compatible host — Netlify, Cloudflare Pages, etc.)

---

## Project Structure

```
app/
  page.tsx                 # Renders the console UI
  layout.tsx / globals.css # Fonts, theme tokens, animation keyframes
  api/
    research/route.ts      # Orchestrates search → crawl → AI analysis
    pdf/route.ts             # Generates the downloadable PDF report
    discord/route.ts         # Bonus: posts the report to a Discord channel
lib/
  serper.ts                 # Serper.dev search + official-website detection
  crawler.ts                 # Website crawler (page discovery + extraction)
  openrouter.ts              # OpenRouter AI analysis + supported model list
  pdf.tsx                     # React-PDF report layout
  types.ts                    # Shared TypeScript types
components/
  ChatInterface.tsx          # Console shell: header, scan well, input bar
  MessageBubble.tsx           # Chat bubbles + radar-sweep progress indicator
  ResearchReport.tsx           # Dossier-style report card
  DiscordSettings.tsx          # Discord bonus settings modal
  RadarScan.tsx                 # Signature radar-sweep component
  TiltCard.tsx                   # Reusable mouse-tracked 3D tilt wrapper
```

---

## Getting Started

### Prerequisites

- Node.js **18.17+** (Node 20 LTS recommended)
- A [Serper.dev](https://serper.dev) API key (free tier available)
- An [OpenRouter](https://openrouter.ai) API key (free trial credits available)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your keys:

| Variable | Required | Description |
|---|:---:|---|
| `SERPER_API_KEY` | ✅ | Search API key from [serper.dev](https://serper.dev). |
| `OPENROUTER_API_KEY` | ✅ | AI API key from [openrouter.ai](https://openrouter.ai). |
| `DEFAULT_AI_MODEL` | – | Fallback model slug (default: `openai/gpt-4o-mini`). |
| `NEXT_PUBLIC_APP_URL` | – | Your deployed URL; sent as OpenRouter's required `HTTP-Referer` header. |
| `DISCORD_BOT_TOKEN` | – (bonus) | Optional server-side default; can also be set per-session in-app. |
| `DISCORD_CHANNEL_ID` | – (bonus) | Optional server-side default; can also be set per-session in-app. |

> ⚠️ Never commit `.env.local` or paste real API keys anywhere public.
> `.env.local` is already gitignored.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel login
vercel
```

Add environment variables (same table as above):

```bash
vercel env add SERPER_API_KEY
vercel env add OPENROUTER_API_KEY
vercel env add DEFAULT_AI_MODEL
```

Then ship to production:

```bash
vercel --prod
```

Update `NEXT_PUBLIC_APP_URL` to your live URL afterward, since OpenRouter
requires a valid referrer header.

Any other Node-compatible platform (Netlify, Cloudflare Pages, Railway, etc.)
works the same way — set the same environment variables in that platform's
dashboard before deploying.

---

## How It Works

```
User input (name or URL)
        │
        ▼
Serper.dev — resolve official website (if a name was given)
        │
        ▼
Crawler — discover + rank same-domain pages, dedupe, extract content
        │
        ▼
Serper.dev — supplemental public info (contact details, competitor hints)
        │
        ▼
OpenRouter — structured JSON: summary, products/services, pain points, competitors
        │
        ▼
Console UI — inline dossier card
        │
        ├──▶ Download PDF (@react-pdf/renderer)
        └──▶ Send to Discord (Bot API + PDF attachment)
```

---

## Design Decisions & Trade-offs

- **No headless browser** for crawling or PDF generation — both use
  lightweight libraries (`cheerio`, `@react-pdf/renderer`) so the app deploys
  cleanly to standard serverless functions without extra build configuration.
- **No database** — per the assignment's requirements, all state lives in the
  browser session; nothing is persisted server-side.
- **Model-agnostic AI layer** — any OpenRouter model slug works out of the
  box; extend the picker by editing `SUPPORTED_MODELS` in `lib/openrouter.ts`.

## Known Limitations / Future Enhancements

- Crawling is capped at 6 pages per site for latency (`MAX_PAGES` in
  `lib/crawler.ts`) — tunable.
- Competitor accuracy depends on the selected model's own knowledge; a
  dedicated Serper "competitors" query fed back into the AI prompt would
  improve precision further.
- No streaming AI responses yet — a streaming implementation would improve
  perceived latency on slower models.

---

## Submission Checklist

- [x] Supports both company names and website URLs
- [x] Uses Serper.dev for search and research
- [x] Crawls company websites
- [x] Uses OpenRouter for AI analysis
- [x] Generates company summaries and AI-generated pain points
- [x] Identifies competitors and displays their names and websites
- [x] Modern ChatGPT-style interface
- [x] Downloadable PDF report
- [x] Discord integration (bonus)
- [ ] Publicly deployed — `<add URL once live>`
- [x] Setup documentation (this file)

---

## Author

**`<Your Name>`**
`<your.email@example.com>` · [GitHub](https://github.com/<your-username>) · [Deployed App](<your-deployment-url>)
