import type { CompanyInfo, Competitor, CrawledPage } from './types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface AnalysisResult {
  company: CompanyInfo;
  competitors: Competitor[];
}

/**
 * Sends crawled website content + supplemental search snippets to an
 * OpenRouter-hosted model and asks it to return structured JSON containing
 * the company profile and a competitor list.
 */
export async function analyzeCompanyWithAI(params: {
  companyNameGuess: string;
  websiteUrl: string;
  crawledPages: CrawledPage[];
  supplementalInfo: string;
  model: string;
}): Promise<AnalysisResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured on the server');
  }

  const crawledText = params.crawledPages
    .map((p) => `PAGE: ${p.url}\nTITLE: ${p.title}\nCONTENT: ${p.content}`)
    .join('\n\n---\n\n')
    .slice(0, 18000); // keep prompt within a safe context budget

  const systemPrompt = `You are a meticulous B2B company research analyst. You will be given raw crawled website content and public search snippets about a company. Extract accurate, concise information and return ONLY valid JSON matching this exact TypeScript shape, with no markdown fences, no commentary:

{
  "company": {
    "name": string,
    "website": string,
    "phone": string | null,
    "address": string | null,
    "productsServices": string[],
    "painPoints": string[],
    "summary": string
  },
  "competitors": [ { "name": string, "website": string } ]
}

Guidelines:
- "painPoints" should be plausible business challenges this company's customers likely face, inferred from their positioning (3-5 items).
- "competitors" should be 3-6 real companies in the same country/industry offering similar products or services. Only include competitors you are reasonably confident exist; use their real official website domains.
- If phone or address cannot be found, use null.
- "summary" should be 2-4 sentences.
- Never invent a company name unrelated to the provided content.`;

  const userPrompt = `Company name guess: ${params.companyNameGuess}
Website: ${params.websiteUrl}

=== CRAWLED WEBSITE CONTENT ===
${crawledText || '(no content could be crawled)'}

=== SUPPLEMENTAL PUBLIC SEARCH SNIPPETS ===
${params.supplementalInfo || '(none found)'}`;

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Company Research Assistant',
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenRouter request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI response was not valid JSON');
  }

  return normalizeAnalysis(parsed, params.websiteUrl);
}

function normalizeAnalysis(parsed: Partial<AnalysisResult>, fallbackWebsite: string): AnalysisResult {
  const company: CompanyInfo = {
    name: parsed.company?.name || 'Unknown Company',
    website: parsed.company?.website || fallbackWebsite,
    phone: parsed.company?.phone ?? null,
    address: parsed.company?.address ?? null,
    productsServices: Array.isArray(parsed.company?.productsServices)
      ? parsed.company!.productsServices
      : [],
    painPoints: Array.isArray(parsed.company?.painPoints) ? parsed.company!.painPoints : [],
    summary: parsed.company?.summary || '',
  };

  const competitors: Competitor[] = Array.isArray(parsed.competitors)
    ? parsed.competitors
        .filter((c): c is Competitor => Boolean(c?.name && c?.website))
        .slice(0, 8)
    : [];

  return { company, competitors };
}

export const SUPPORTED_MODELS = [
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini (fast, cheap)' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-flash-1.5', label: 'Gemini 1.5 Flash' },
  { id: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
];
