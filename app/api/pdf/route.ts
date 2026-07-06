import { NextRequest, NextResponse } from 'next/server';
import { generatePdfBuffer } from '@/lib/pdf';
import type { ResearchResult } from '@/lib/types';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const result: ResearchResult = await req.json();

    if (!result?.company?.name) {
      return NextResponse.json({ error: 'Missing research result data.' }, { status: 400 });
    }

    const pdfBuffer = await generatePdfBuffer(result);
    const filename = `${result.company.name.replace(/[^a-z0-9]/gi, '_')}_research_report.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate PDF.' }, { status: 500 });
  }
}
