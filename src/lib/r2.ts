import crypto from 'crypto';

const accountId = process.env.R2_ACCOUNT_ID || 'e1eb6dbbb4524e1a5ba1402c44caa221';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '8b314e2a0eaf075a80a61a9e3d79b936';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '7196876db8c331b52b07cc2b89db60f3dd048617dfd7ac01498582219b236ff0';
const bucket = process.env.R2_BUCKET_NAME || 'clasy';
const region = 'auto';

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucket);

function assertConfigured() {
  if (!isR2Configured) {
    throw new Error('Cloudflare R2 is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME to .env.local.');
  }
}

function awsEncode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodePath(path: string) {
  return '/' + path.split('/').map(awsEncode).join('/');
}

function hmac(key: string | Buffer, data: string) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getSigningKey(date: string) {
  const kDate = hmac(`AWS4${secretAccessKey}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, 's3');
  return hmac(kService, 'aws4_request');
}

function canonicalQuery(params: Record<string, string>) {
  return Object.entries(params)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, value]) => `${awsEncode(key)}=${awsEncode(value)}`)
    .join('&');
}

export function createPresignedUrl({
  method,
  key,
  expiresIn = 900,
  contentType,
  downloadName,
  inline = false,
}: {
  method: 'GET' | 'PUT' | 'DELETE';
  key: string;
  expiresIn?: number;
  contentType?: string;
  downloadName?: string;
  inline?: boolean;
}) {
  assertConfigured();
  if (!key || key.includes('..')) throw new Error('Invalid R2 object key.');
  if (expiresIn < 1 || expiresIn > 604800) throw new Error('Invalid R2 URL expiry.');

  const host = `${bucket}.${accountId}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const shortDate = amzDate.slice(0, 8);
  const credentialScope = `${shortDate}/${region}/s3/aws4_request`;

  const query: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresIn),
    'X-Amz-SignedHeaders': contentType && method === 'PUT' ? 'content-type;host' : 'host',
  };

  if (downloadName && method === 'GET') {
    if (inline) {
      query['response-content-disposition'] = `inline; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
    } else {
      query['response-content-disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
      query['response-content-type'] = 'application/octet-stream';
    }
  }

  const canonicalHeaders = contentType && method === 'PUT'
    ? `content-type:${contentType}\nhost:${host}\n`
    : `host:${host}\n`;
  const signedHeaders = contentType && method === 'PUT' ? 'content-type;host' : 'host';
  const canonicalRequest = [
    method,
    encodePath(key),
    canonicalQuery(query),
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  const signature = crypto
    .createHmac('sha256', getSigningKey(shortDate))
    .update(stringToSign)
    .digest('hex');

  query['X-Amz-Signature'] = signature;
  return `https://${host}${encodePath(key)}?${canonicalQuery(query)}`;
}

export function r2ObjectKey(branchCode: string, semester: number, subjectId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(-150);
  return `${branchCode.toLowerCase()}/semester-${semester}/${subjectId}/${Date.now()}-${safeName}`;
}

export function validateNoteFile(fileName: string, contentType: string, size: number) {
  const allowedTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/png',
    'image/jpeg',
  ]);

  const ext = fileName.toLowerCase().split('.').pop() || '';
  const allowedExt = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg']);

  if (!allowedTypes.has(contentType) || !allowedExt.has(ext)) {
    throw new Error('Unsupported file type. Use PDF, DOC/DOCX, PPT/PPTX, TXT, PNG or JPG.');
  }
  if (size > 50 * 1024 * 1024) {
    throw new Error('File is too large. Maximum allowed size is 50 MB.');
  }
}

export { bucket };
