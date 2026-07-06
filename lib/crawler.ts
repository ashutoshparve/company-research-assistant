import * as cheerio from 'cheerio';
import type { CrawledPage } from './types';

const PRIORITY_KEYWORDS = [
  'about',
  'product',
  'service',
  'solution',
  'contact',
  'pricing',
  'plans',
  'company',
];

const IGNORE_KEYWORDS = [
  'login',
  'signin',
  'sign-in',
  'signup',
  'sign-up',
  'register',
  'cart',
  'checkout',
  'account',
  'privacy',
  'terms',
  'cookie',
  'wp-admin',
  '.pdf',
  '.zip',
  '.jpg',
  '.png',
  '.svg',
  'mailto:',
  'tel:',
];

const MAX_PAGES = 6;
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CompanyResearchBot/1.0; +https://example.com/bot)',
      },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractTextContent($: cheerio.CheerioAPI): string {
  $('script, style, noscript, svg, iframe').remove();
  const text = $('body').text();
  return text.replace(/\s+/g, ' ').trim().slice(0, 6000);
}

function discoverLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const found = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const lower = href.toLowerCase();
    if (IGNORE_KEYWORDS.some((kw) => lower.includes(kw))) return;

    try {
      const resolved = new URL(href, base);
      if (resolved.hostname.replace('www.', '') !== base.hostname.replace('www.', '')) {
        return; // stay on the same domain
      }
      resolved.hash = '';
      found.add(resolved.toString());
    } catch {
      // ignore malformed links
    }
  });

  return Array.from(found);
}

function rankLinksByPriority(links: string[]): string[] {
  return links
    .map((link) => {
      const lower = link.toLowerCase();
      const score = PRIORITY_KEYWORDS.reduce(
        (acc, kw) => (lower.includes(kw) ? acc + 1 : acc),
        0
      );
      return { link, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.link);
}

/**
 * Crawls a website starting from its homepage: discovers priority pages
 * (About, Products, Services, Solutions, Contact, Pricing), dedupes them,
 * skips login/irrelevant pages, and extracts cleaned text content from each.
 */
export async function crawlWebsite(startUrl: string): Promise<CrawledPage[]> {
  const pages: CrawledPage[] = [];
  const visited = new Set<string>();

  const homeHtml = await fetchWithTimeout(startUrl);
  if (!homeHtml) return pages;

  const $home = cheerio.load(homeHtml);
  pages.push({
    url: startUrl,
    title: $home('title').first().text().trim() || startUrl,
    content: extractTextContent($home),
  });
  visited.add(normalizePath(startUrl));

  const discovered = discoverLinks($home, startUrl);
  const ranked = rankLinksByPriority(discovered);

  for (const link of ranked) {
    if (pages.length >= MAX_PAGES) break;
    const key = normalizePath(link);
    if (visited.has(key)) continue;
    visited.add(key);

    const html = await fetchWithTimeout(link);
    if (!html) continue;

    const $page = cheerio.load(html);
    const content = extractTextContent($page);
    if (!content || content.length < 50) continue; // skip near-empty / irrelevant pages

    pages.push({
      url: link,
      title: $page('title').first().text().trim() || link,
      content,
    });
  }

  return pages;
}

function normalizePath(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.replace('www.', '')}${u.pathname.replace(/\/$/, '')}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
