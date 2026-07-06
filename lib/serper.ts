const SERPER_URL = 'https://google.serper.dev/search';

export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet?: string;
}

export interface SerperResponse {
  organic?: SerperOrganicResult[];
  knowledgeGraph?: {
    title?: string;
    website?: string;
    description?: string;
    attributes?: Record<string, string>;
  };
}

/**
 * Runs a single Serper.dev search query.
 */
export async function serperSearch(query: string): Promise<SerperResponse> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('SERPER_API_KEY is not configured on the server');
  }

  const res = await fetch(SERPER_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10 }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Serper.dev request failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Given a company name, tries to find its official website using Serper.dev.
 * Uses the knowledge graph first (most reliable), then falls back to the
 * first organic result that doesn't look like a directory / social site.
 */
export async function findOfficialWebsite(companyName: string): Promise<string | null> {
  const result = await serperSearch(`${companyName} official website`);

  if (result.knowledgeGraph?.website) {
    return normalizeUrl(result.knowledgeGraph.website);
  }

  const blockedHosts = [
    'wikipedia.org',
    'linkedin.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'crunchbase.com',
    'glassdoor.com',
    'indeed.com',
    'youtube.com',
    'bloomberg.com',
    'reddit.com',
  ];

  const candidate = result.organic?.find((r) => {
    try {
      const host = new URL(r.link).hostname.replace('www.', '');
      return !blockedHosts.some((blocked) => host.includes(blocked));
    } catch {
      return false;
    }
  });

  return candidate ? normalizeUrl(candidate.link) : null;
}

/**
 * Collects supplemental public information about a company (phone, address,
 * competitors) using a handful of targeted Serper.dev queries.
 */
export async function gatherSupplementalInfo(companyName: string) {
  const queries = [
    `${companyName} contact phone number address`,
    `${companyName} competitors alternatives`,
    `${companyName} products services`,
  ];

  const results = await Promise.all(
    queries.map((q) => serperSearch(q).catch(() => null))
  );

  const snippets: string[] = [];
  for (const r of results) {
    if (!r) continue;
    if (r.knowledgeGraph?.description) snippets.push(r.knowledgeGraph.description);
    for (const org of r.organic ?? []) {
      if (org.snippet) snippets.push(`${org.title}: ${org.snippet} (${org.link})`);
    }
  }

  return snippets.join('\n');
}

export function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u}`;
  }
  try {
    const parsed = new URL(u);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return u;
  }
}

export function looksLikeUrl(input: string): boolean {
  return /^https?:\/\//i.test(input.trim()) || /\.[a-z]{2,}(\/|$)/i.test(input.trim());
}
