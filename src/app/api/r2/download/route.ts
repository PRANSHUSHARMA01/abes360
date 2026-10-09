import { NextResponse } from 'next/server';
import { createPresignedUrl, isR2Configured } from '@/lib/r2';
import { applyClasyWatermark } from '@/lib/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeGoogleDriveUrl(urlStr: string): string {
  // Extract file ID from Google Drive links:
  // https://drive.google.com/file/d/FILE_ID/view...
  // https://drive.google.com/open?id=FILE_ID
  const match1 = urlStr.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) {
    return `https://drive.google.com/uc?export=download&id=${match1[1]}`;
  }
  const match2 = urlStr.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) {
    return `https://drive.google.com/uc?export=download&id=${match2[1]}`;
  }
  return urlStr;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    const filename = url.searchParams.get('filename') || 'clasy-note.pdf';
    const inline = url.searchParams.get('inline') === 'true';

    if (!key) {
      return NextResponse.json({ error: 'Missing file key or URL.' }, { status: 400 });
    }

    let rawBuffer: ArrayBuffer | null = null;
    let contentType = filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';

    // Case 1: Key is an HTTP/HTTPS URL (Google Drive, Supabase Storage, CDN, etc.)
    if (key.startsWith('http://') || key.startsWith('https://')) {
      const fetchUrl = normalizeGoogleDriveUrl(key);
      const res = await fetch(fetchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      if (res.ok) {
        rawBuffer = await res.arrayBuffer();
        const headerType = res.headers.get('content-type');
        if (headerType && !headerType.includes('text/html')) {
          contentType = headerType;
        }
      } else {
        console.warn('External file fetch returned status:', res.status);
      }
    } else if (isR2Configured) {
      // Case 2: Key is a Cloudflare R2 object key
      try {
        const presignedUrl = createPresignedUrl({
          method: 'GET',
          key,
          expiresIn: 3600,
          downloadName: filename,
          inline,
        });

        const r2Res = await fetch(presignedUrl);
        if (r2Res.ok) {
          rawBuffer = await r2Res.arrayBuffer();
          const headerType = r2Res.headers.get('content-type');
          if (headerType) contentType = headerType;
        }
      } catch (r2Err) {
        console.warn('R2 fetch exception:', r2Err);
      }
    }

    if (!rawBuffer) {
      // If server could not stream directly and key is a URL, redirect to it as last resort
      if (key.startsWith('http://') || key.startsWith('https://')) {
        return NextResponse.redirect(key, 302);
      }
      return NextResponse.json({ error: 'File not found or inaccessible.' }, { status: 404 });
    }

    let finalBuffer: Uint8Array | ArrayBuffer = rawBuffer;
    const ext = filename.toLowerCase().split('.').pop() || '';
    const isPdf = ext === 'pdf' || contentType.includes('pdf');

    // Apply Clasy watermark only when downloading a PDF (not inline viewing and not images)
    if (!inline && isPdf) {
      finalBuffer = await applyClasyWatermark(rawBuffer);
    }

    const safeFilename = filename;

    return new Response(finalBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': isPdf ? 'application/pdf' : contentType,
        'Content-Disposition': inline 
          ? `inline; filename="${encodeURIComponent(safeFilename)}"`
          : `attachment; filename="${encodeURIComponent(safeFilename)}"`,
        'Cache-Control': inline ? 'public, max-age=86400' : 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Download route error:', error);
    return NextResponse.json({ error: error?.message || 'Server error processing file.' }, { status: 500 });
  }
}
