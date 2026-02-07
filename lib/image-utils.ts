// Image utility functions for handling various image sources

/**
 * Check if URL is a DiceBear SVG avatar
 */
export function isDiceBearAvatar(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('api.dicebear.com') || url.includes('dicebear');
}

/**
 * Check if URL is an audio file (should not be used in Image component)
 */
export function isAudioUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma'];
  return audioExtensions.some(ext => url.toLowerCase().includes(ext));
}

/**
 * Check if URL is an SVG (needs unoptimized prop)
 */
export function isSvgUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.toLowerCase().includes('.svg') || url.includes('/svg');
}

/**
 * Check if URL should have unoptimized prop
 */
export function shouldBeUnoptimized(url: string | undefined | null): boolean {
  return isDiceBearAvatar(url) || isSvgUrl(url);
}

/**
 * Check if URL is a valid image URL (not audio/video)
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  // Reject audio files
  if (isAudioUrl(url)) return false;
  // Reject video files
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  if (videoExtensions.some(ext => url.toLowerCase().includes(ext))) return false;
  return true;
}

/**
 * Get safe avatar URL - returns null if not a valid image
 */
export function getSafeAvatarUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  if (!isValidImageUrl(url)) return null;
  return url;
}
