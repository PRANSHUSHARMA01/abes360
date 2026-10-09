import { supabase, isSupabaseConfigured } from './supabase';

function guessMimeType(fileName: string, browserType: string) {
  if (browserType) return browserType;
  const ext = fileName.toLowerCase().split('.').pop();
  const map: Record<string, string> = { 
    pdf: 'application/pdf', 
    doc: 'application/msword', 
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    ppt: 'application/vnd.ms-powerpoint', 
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    txt: 'text/plain', 
    png: 'image/png', 
    jpg: 'image/jpeg', 
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif'
  };
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
}): Promise<string> {
  // 1. Primary: Server-side Direct Upload to Cloudflare R2 (Bypasses all client-side CORS issues)
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('branchCode', branchCode);
    formData.append('semester', String(semester));
    formData.append('subjectId', subjectId);

    const directRes = await fetch('/api/r2/direct-upload', {
      method: 'POST',
      body: formData,
    });

    if (directRes.ok) {
      const payload = await directRes.json();
      if (payload.key) {
        return payload.key as string;
      }
    }
  } catch (directErr) {
    console.warn('Direct R2 server upload attempt failed, trying presigned PUT:', directErr);
  }

  // 2. Secondary: Cloudflare R2 presigned upload
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
    console.warn('Cloudflare R2 presigned upload bypassed, checking Supabase Storage:', r2Err);
  }

  // 3. Fallback: Supabase Storage
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

  // 4. In-memory object URL fallback
  return URL.createObjectURL(file);
}

export function getNoteDownloadUrl(filePath: string, fileName?: string) {
  if (!filePath) return '';
  if (filePath.startsWith('blob:') || filePath.startsWith('data:')) {
    return filePath;
  }
  const cleanName = (fileName || filePath.split('/').pop() || 'clasy-document.pdf').replace(/[/\\?%*:|"<>]/g, '-');
  const hasExt = cleanName.includes('.');
  const safeFilename = hasExt ? cleanName : `${cleanName}.pdf`;
  const params = new URLSearchParams({ 
    key: filePath, 
    filename: safeFilename 
  });
  return `/api/r2/download?${params.toString()}`;
}

export function getNoteViewUrl(filePath: string, fileName?: string) {
  if (!filePath) return '';
  if (filePath.startsWith('blob:') || filePath.startsWith('data:')) {
    return filePath;
  }
  const cleanName = (fileName || filePath.split('/').pop() || 'clasy-document.pdf').replace(/[/\\?%*:|"<>]/g, '-');
  const hasExt = cleanName.includes('.');
  const safeFilename = hasExt ? cleanName : `${cleanName}.pdf`;
  const params = new URLSearchParams({ 
    key: filePath, 
    filename: safeFilename,
    inline: 'true' 
  });
  return `/api/r2/download?${params.toString()}`;
}

export async function deleteFileFromR2(filePath: string) {
  if (!filePath || filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('blob:')) return;
  try {
    const response = await fetch('/api/r2/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: filePath }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      console.warn('R2 delete warning:', payload?.error || 'Could not delete file');
    }
  } catch (delErr) {
    console.warn('R2 delete exception:', delErr);
  }
}
