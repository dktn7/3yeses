const BLOCKED_DEMO_HOSTS = new Set([
  'picsum.photos',
  'sample-videos.com',
  'samplelib.com',
  'example.com',
  'randomuser.me',
  'commondatastorage.googleapis.com',
]);

const LOCAL_IMAGE_FALLBACK = '/images/hero-poster.webp';
const LOCAL_VIDEO_FALLBACK = '/videos/Welcome.mp4';
const LOCAL_AVATAR_FALLBACK = '/logo.svg';

function getHostname(input: string) {
  try {
    return new URL(input).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isBlockedDemoUrl(url?: string | null) {
  if (!url) return false;
  const hostname = getHostname(url);
  return hostname ? BLOCKED_DEMO_HOSTS.has(hostname) : false;
}

export function resolveHubMediaUrl(url?: string | null, type?: string | null) {
  if (!url) return url ?? '';

  if (!isBlockedDemoUrl(url)) {
    return url;
  }

  const normalizedType = (type || '').toUpperCase();
  if (normalizedType === 'IMAGE' || normalizedType === 'AVATAR') {
    return LOCAL_IMAGE_FALLBACK;
  }

  return LOCAL_VIDEO_FALLBACK;
}

export function resolveHubThumbnailUrl(
  thumbnail?: string | null,
  mediaUrl?: string | null,
  type?: string | null
) {
  if (thumbnail && !isBlockedDemoUrl(thumbnail)) {
    return thumbnail;
  }

  const normalizedType = (type || '').toUpperCase();
  if (normalizedType === 'IMAGE' && mediaUrl) {
    return resolveHubMediaUrl(mediaUrl, normalizedType);
  }

  if (normalizedType === 'VIDEO' || normalizedType === 'AUDIO') {
    return LOCAL_IMAGE_FALLBACK;
  }

  if (mediaUrl && !isBlockedDemoUrl(mediaUrl)) {
    return mediaUrl;
  }

  return LOCAL_IMAGE_FALLBACK;
}

export function resolveHubAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return LOCAL_AVATAR_FALLBACK;
  return isBlockedDemoUrl(avatarUrl) ? LOCAL_AVATAR_FALLBACK : avatarUrl;
}
