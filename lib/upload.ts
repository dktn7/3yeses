// File upload utility for handling media uploads via ImageKit
// Client-side: files upload directly to ImageKit via @imagekit/next
// Server-side: API routes receive ImageKit response data (url, fileId) and save to DB

export interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
  filename?: string;
}

// Generate unique filename
export function generateFilename(originalName: string, userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop();
  const prefix = userId ? `${userId}_` : '';
  return `${prefix}${timestamp}_${random}.${ext}`;
}

// Validate file size
export function validateFileSize(size: number, maxSizeMB: number): boolean {
  return size <= maxSizeMB * 1024 * 1024;
}

// Validate image file type
export function validateImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType);
}

// Validate video file type
export function validateVideoType(mimeType: string): boolean {
  const validTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/avi',
    'video/x-matroska',
  ];
  return validTypes.includes(mimeType);
}

// ImageKit folder paths for different upload types
export const IMAGEKIT_FOLDERS = {
  profiles: '/profiles',
  portfolio: '/portfolio',
  videos: '/videos',
} as const;

// Determine ImageKit folder from upload type
export function getImageKitFolder(type: 'profile' | 'portfolio' | 'video'): string {
  switch (type) {
    case 'profile':
      return IMAGEKIT_FOLDERS.profiles;
    case 'portfolio':
      return IMAGEKIT_FOLDERS.portfolio;
    case 'video':
      return IMAGEKIT_FOLDERS.videos;
    default:
      return '/uploads';
  }
}
