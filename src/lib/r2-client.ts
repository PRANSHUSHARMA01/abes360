import { supabase, isSupabaseConfigured } from './supabase';

function guessMimeType(fileName: string, browserType: string) {
  if (browserType) return browserType;
  const ext = fileName.toLowerCase().split('.').pop();
  const map: Record<string, string> = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', txt: 'text/plain', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };
  return map[ext || ''] || 'application/octet-stream';
}

export async function uploadFileToR2({
  file,
  branchCode,
  semester,
  subjectId,
}: {
  file: File;
  branchCode: string;
  semester: number;
  subjectId: string;
}) {
  // 1. Try Cloudflare R2 presigned upload first
  try {
    const response = await fetch('/api/r2/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branchCode,
        semester,
        subjectId,
        fileName: file.name,
        contentType: guessMimeType(file.name, file.type),
        size: file.size,
      }),
    });

    if (response.ok) {
      const payload = await response.json();
      const uploadResponse = await fetch(payload.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': guessMimeType(file.name, file.type) },
        body: file,
      });

      if (uploadResponse.ok) {
        return payload.key as string;
      }
    }
  } catch (r2Err) {
    console.warn('Cloudflare R2 upload bypassed, checking Supabase Storage:', r2Err);
  }

  // 2. Seamless Cloud Storage via Supabase
  if (isSupabaseConfigured) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
      const storagePath = `${branchCode.toLowerCase()}/sem-${semester}/${subjectId}/${Date.now()}-${cleanName}`;
      const { data, error } = await supabase.storage.from('notes').upload(storagePath, file, {
        upsert: true,
        contentType: guessMimeType(file.name, file.type),
      });
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('notes').getPublicUrl(storagePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (supaErr) {
      console.warn('Supabase storage fallback error:', supaErr);
    }
  }

  // 3. Fallback to local object URL
  return URL.createObjectURL(file);
}

export function getNoteDownloadUrl(filePath: string, fileName?: string) {
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const params = new URLSearchParams({ key: filePath, filename: fileName || filePath.split('/').pop() || 'clasy-note' });
  return `/api/r2/download?${params.toString()}`;
}

export function getNoteViewUrl(filePath: string, fileName?: string) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:') || filePath.startsWith('data:')) return filePath;
  const params = new URLSearchParams({ 
    key: filePath, 
    filename: fileName || filePath.split('/').pop() || 'clasy-note',
    inline: 'true' 
  });
  return `/api/r2/download?${params.toString()}`;
}

export async function deleteFileFromR2(filePath: string) {
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return;
  const response = await fetch('/api/r2/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: filePath }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Could not delete the file from R2.');
}
