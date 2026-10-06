import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // The current project uses a client-side admin PIN. Keep deletion compatible with that flow.
  // For production, switch the admin panel to Supabase Auth and verify the user server-side here.
  try {
    const body = await request.json();
    const key = String(body?.key || '');
    if (!key || key.includes('..')) return NextResponse.json({ error: 'Invalid file key.' }, { status: 400 });

    const { createPresignedUrl, isR2Configured } = await import('@/lib/r2');
    if (!isR2Configured) return NextResponse.json({ error: 'R2 is not configured.' }, { status: 503 });

    // Delete via the S3-compatible REST API using a short-lived signed DELETE URL.
    const deleteUrl = createPresignedUrl({ method: 'DELETE', key, expiresIn: 300 });
    const response = await fetch(deleteUrl, { method: 'DELETE' });
    if (!response.ok && response.status !== 404) {
      throw new Error(`R2 delete failed with status ${response.status}.`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not delete file.' }, { status: 500 });
  }
}
