import { NextRequest, NextResponse } from 'next/server';
import { generatePdfBuffer } from '@/lib/pdf';
import type { ResearchResult } from '@/lib/types';

export const maxDuration = 30;

interface DiscordPayload {
  botToken: string;
  channelId: string;
  applicantName: string;
  applicantEmail: string;
  result: ResearchResult;
}

export async function POST(req: NextRequest) {
  try {
    const body: DiscordPayload = await req.json();
    const botToken = body.botToken || process.env.DISCORD_BOT_TOKEN;
    const channelId = body.channelId || process.env.DISCORD_CHANNEL_ID;

    if (!botToken || !channelId) {
      return NextResponse.json(
        { error: 'Discord Bot Token and Channel ID are required.' },
        { status: 400 }
      );
    }
    if (!body.result?.company?.name) {
      return NextResponse.json({ error: 'Missing research result data.' }, { status: 400 });
    }

    const pdfBuffer = await generatePdfBuffer(body.result);
    const filename = `${body.result.company.name.replace(/[^a-z0-9]/gi, '_')}_research_report.pdf`;

    const embed = {
      title: `New Company Research Report: ${body.result.company.name}`,
      color: 0x3b5bdb,
      fields: [
        { name: 'Applicant Name', value: body.applicantName || 'N/A', inline: true },
        { name: 'Applicant Email', value: body.applicantEmail || 'N/A', inline: true },
        { name: 'Company Name', value: body.result.company.name, inline: false },
        { name: 'Company Website', value: body.result.company.website, inline: false },
      ],
      timestamp: new Date().toISOString(),
    };

    const form = new FormData();
    form.append('payload_json', JSON.stringify({ embeds: [embed] }));
    form.append('files[0]', new Blob([pdfBuffer], { type: 'application/pdf' }), filename);

    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
        },
        body: form,
      }
    );

    if (!discordRes.ok) {
      const text = await discordRes.text().catch(() => '');
      return NextResponse.json(
        { error: `Discord API error (${discordRes.status}): ${text}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Discord integration error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to send report to Discord.' },
      { status: 500 }
    );
  }
}
