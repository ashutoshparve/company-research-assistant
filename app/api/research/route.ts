import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsite } from '@/lib/crawler';
import { findOfficialWebsite, gatherSupplementalInfo, looksLikeUrl, normalizeUrl } from '@/lib/serper';
import { analyzeCompanyWithAI } from '@/lib/openrouter';
import type { ResearchRequestBody, ResearchResult } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body: ResearchRequestBody = await req.json();
    const input = (body.input || '').trim();
    const model = body.model || process.env.DEFAULT_AI_MODEL || 'openai/gpt-4o-mini';

    if (!input) {
      return NextResponse.json({ error: 'Please provide a company name or website URL.' }, { status: 400 });
    }

    // 1. Determine the official website
    let websiteUrl: string;
    let companyNameGuess: string;

    if (looksLikeUrl(input)) {
      websiteUrl = normalizeUrl(input);
      companyNameGuess = new URL(websiteUrl).hostname.replace('www.', '').split('.')[0];
    } else {
      companyNameGuess = input;
      const found = await findOfficialWebsite(input);
      if (!found) {
        return NextResponse.json(
          { error: `Could not determine an official website for "${input}". Try providing the website URL directly.` },
          { status: 404 }
        );
      }
      websiteUrl = found;
    }

    // 2. Crawl the website
    const crawledPages = await crawlWebsite(websiteUrl);

    // 3. Gather supplemental public info via Serper.dev
    const supplementalInfo = await gatherSupplementalInfo(companyNameGuess);

    // 4. AI analysis via OpenRouter
    const { company, competitors } = await analyzeCompanyWithAI({
      companyNameGuess,
      websiteUrl,
      crawledPages,
      supplementalInfo,
      model,
    });

    const result: ResearchResult = {
      company,
      competitors,
      crawledPages: crawledPages.map((p) => ({ url: p.url, title: p.title })),
      modelUsed: model,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Research error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong while researching the company.' },
      { status: 500 }
    );
  }
}
