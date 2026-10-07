import { NextResponse } from 'next/server';
import { createPresignedUrl, isR2Configured } from '@/lib/r2';

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

    const downloadUrl = createPresignedUrl({
      method: 'GET',
      key,
      expiresIn: 3600,
      downloadName: filename,
      inline,
    });

    // Fetch from R2 on the server side to stream directly to client, avoiding cross-origin iframe / CORS issues
    try {
      const r2Res = await fetch(downloadUrl);
      if (r2Res.ok) {
        const arrayBuffer = await r2Res.arrayBuffer();
        const contentType = r2Res.headers.get('content-type') || (filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
        
        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': inline 
              ? `inline; filename="${encodeURIComponent(filename)}"`
              : `attachment; filename="${encodeURIComponent(filename)}"`,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          },
        });
      }
    } catch (fetchErr) {
      console.warn('Server streaming from R2 failed, falling back to 302 redirect:', fetchErr);
    }

    return NextResponse.redirect(downloadUrl, 302);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not create download URL.' }, { status: 500 });
  }
}
