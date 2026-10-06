import { NextResponse } from 'next/server';
import { createPresignedUrl, isR2Configured, r2ObjectKey, validateNoteFile } from '@/lib/r2';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!isR2Configured) {
      return NextResponse.json({ error: 'R2 is not configured.' }, { status: 503 });
    }

    const body = await request.json();
    const { branchCode, semester, subjectId, fileName, contentType, size } = body;

    if (!branchCode || !semester || !subjectId || !fileName || !contentType || !size) {
      return NextResponse.json({ error: 'Missing file upload details.' }, { status: 400 });
    }

    validateNoteFile(fileName, contentType, Number(size));
    const key = r2ObjectKey(String(branchCode), Number(semester), String(subjectId), String(fileName));
    const uploadUrl = createPresignedUrl({ method: 'PUT', key, expiresIn: 900, contentType });

    return NextResponse.json({ key, uploadUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not create upload URL.' }, { status: 500 });
  }
}
