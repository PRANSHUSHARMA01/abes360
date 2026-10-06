import { NextResponse } from 'next/server';
import { createPresignedUrl } from '@/lib/r2';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    const filename = url.searchParams.get('filename') || 'clasy-note';
    const inline = url.searchParams.get('inline') === 'true';

    if (!key) return NextResponse.json({ error: 'Missing file key.' }, { status: 400 });

    const downloadUrl = createPresignedUrl({
      method: 'GET',
      key,
      expiresIn: 1800,
      downloadName: filename,
      inline,
    });

    return NextResponse.redirect(downloadUrl, 302);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not create download URL.' }, { status: 500 });
  }
}
