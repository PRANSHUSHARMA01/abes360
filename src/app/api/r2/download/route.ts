import { NextResponse } from 'next/server';
import { createPresignedUrl, isR2Configured } from '@/lib/r2';
import { applyClasyWatermark } from '@/lib/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    const filename = url.searchParams.get('filename') || 'clasy-note.pdf';
    const inline = url.searchParams.get('inline') === 'true';

    if (!key) {
      return NextResponse.json({ error: 'Missing file key.' }, { status: 400 });
    }

    if (!isR2Configured) {
      return NextResponse.json({ error: 'R2 is not configured.' }, { status: 503 });
    }

    const presignedUrl = createPresignedUrl({
      method: 'GET',
      key,
      expiresIn: 3600,
      downloadName: filename,
      inline,
    });

    try {
      const r2Res = await fetch(presignedUrl);
      if (r2Res.ok) {
        const arrayBuffer = await r2Res.arrayBuffer();
        const contentType = r2Res.headers.get('content-type') || (filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
        
        let finalBuffer: Uint8Array | ArrayBuffer = arrayBuffer;

        // If downloading (not inline viewing) and the document is a PDF, apply the Clasy watermark
        if (!inline && (contentType.includes('pdf') || filename.toLowerCase().endsWith('.pdf'))) {
          finalBuffer = await applyClasyWatermark(arrayBuffer);
        }

        return new Response(finalBuffer as any, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': inline 
              ? `inline; filename="${encodeURIComponent(filename)}"`
              : `attachment; filename="${encodeURIComponent(filename)}"`,
            'Cache-Control': inline ? 'public, max-age=86400, stale-while-revalidate=3600' : 'no-cache',
          },
        });
      }
    } catch (fetchErr) {
      console.warn('Server streaming from R2 failed, falling back to 302 redirect:', fetchErr);
    }

    return NextResponse.redirect(presignedUrl, 302);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not process file.' }, { status: 500 });
  }
}
