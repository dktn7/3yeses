import ImageKit from '@imagekit/nodejs';
import crypto from 'crypto';

// ── ImageKit Configuration ──────────────────────────────────────────────────
// Env vars: IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
// Dashboard: https://imagekit.io/dashboard/developer/api-keys

export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || '';
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || '';
export const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/3YESES';

// Server-side ImageKit client (for uploads, deletes, listing)
const imagekit = new ImageKit({
  privateKey: IMAGEKIT_PRIVATE_KEY,
});

export default imagekit;

// ── Client-side auth parameters ─────────────────────────────────────────────
// Generate token, expire, and signature for client-side direct uploads
// Uses HMAC-SHA1(token + expire) signed with the private key
export function getAuthenticationParameters() {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes
  const signature = crypto
    .createHmac('sha1', IMAGEKIT_PRIVATE_KEY)
    .update(token + expire)
    .digest('hex');

  return { token, expire, signature };
}

// ── File type & size validators (reused from old cloudinary-config) ─────────

export const ALLOWED_FILE_TYPES = {
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
};

export const MAX_FILE_SIZES = {
  video: 100 * 1024 * 1024, // 100MB
  image: 10 * 1024 * 1024,  // 10MB
  audio: 20 * 1024 * 1024,  // 20MB
};

export function validateFileType(mimetype: string, type: 'video' | 'image' | 'audio'): boolean {
  return ALLOWED_FILE_TYPES[type].includes(mimetype);
}

export function validateFileSize(size: number, type: 'video' | 'image' | 'audio'): boolean {
  return size <= MAX_FILE_SIZES[type];
}
