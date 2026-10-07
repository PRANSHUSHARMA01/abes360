import { NextResponse } from 'next/server';
import { createPresignedUrl, isR2Configured, r2ObjectKey, validateNoteFile } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const branchCode = (formData.get('branchCode') as string) || 'CSE';
    const semester = Number(formData.get('semester')) || 3;
    const subjectId = (formData.get('subjectId') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const fileName = file.name;
    const contentType = file.type || 'application/pdf';
    const size = file.size;

    validateNoteFile(fileName, contentType, size);

    if (isR2Configured) {
      const key = r2ObjectKey(branchCode, semester, subjectId, fileName);
      const uploadUrl = createPresignedUrl({
        method: 'PUT',
        key,
        expiresIn: 600,
        contentType,
      });

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const r2PutRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: buffer,
      });

      if (r2PutRes.ok) {
        return NextResponse.json({ success: true, key, fileName });
      } else {
        const errorText = await r2PutRes.text().catch(() => '');
        console.warn('R2 direct PUT failed:', r2PutRes.status, errorText);
      }
    }

    return NextResponse.json({ error: 'R2 storage upload failed.' }, { status: 500 });
  } catch (error: any) {
    console.error('Direct upload exception:', error);
    return NextResponse.json({ error: error?.message || 'Server error during upload.' }, { status: 500 });
  }
}
