// File upload utility for handling media uploads
// Supports profile photos, portfolio images, and videos

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  filename?: string;
}

// Base upload directory (public/uploads)
const UPLOAD_BASE_DIR = join(process.cwd(), 'public', 'uploads');

// Upload subdirectories
const UPLOAD_DIRS = {
  profiles: join(UPLOAD_BASE_DIR, 'profiles'),
  portfolio: join(UPLOAD_BASE_DIR, 'portfolio'),
  videos: join(UPLOAD_BASE_DIR, 'videos'),
};

// Ensure upload directories exist
export async function ensureUploadDirs() {
  for (const dir of Object.values(UPLOAD_DIRS)) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
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

// Upload profile photo
export async function uploadProfilePhoto(
  file: File,
  userId?: string
): Promise<UploadResult> {
  try {
    await ensureUploadDirs();

    // Validate file type
    if (!validateImageType(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      };
    }

    // Validate file size (max 5MB)
    if (!validateFileSize(file.size, 5)) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename and path
    const filename = generateFilename(file.name, userId);
    const filepath = join(UPLOAD_DIRS.profiles, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/profiles/${filename}`;
    return {
      success: true,
      url,
      filename,
    };
  } catch (error) {
    console.error('Profile photo upload error:', error);
    return {
      success: false,
      error: 'Failed to upload profile photo',
    };
  }
}

// Upload portfolio image
export async function uploadPortfolioImage(
  file: File,
  userId?: string
): Promise<UploadResult> {
  try {
    await ensureUploadDirs();

    // Validate file type
    if (!validateImageType(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      };
    }

    // Validate file size (max 5MB)
    if (!validateFileSize(file.size, 5)) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename and path
    const filename = generateFilename(file.name, userId);
    const filepath = join(UPLOAD_DIRS.portfolio, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/portfolio/${filename}`;
    return {
      success: true,
      url,
      filename,
    };
  } catch (error) {
    console.error('Portfolio image upload error:', error);
    return {
      success: false,
      error: 'Failed to upload portfolio image',
    };
  }
}

// Upload video
export async function uploadVideo(
  file: File,
  userId?: string
): Promise<UploadResult> {
  try {
    await ensureUploadDirs();

    // Validate file type
    if (!validateVideoType(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only MP4, MOV, AVI, WebM, and MKV are allowed.',
      };
    }

    // Validate file size (max 100MB)
    if (!validateFileSize(file.size, 100)) {
      return {
        success: false,
        error: 'File size exceeds 100MB limit.',
      };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename and path
    const filename = generateFilename(file.name, userId);
    const filepath = join(UPLOAD_DIRS.videos, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/videos/${filename}`;
    return {
      success: true,
      url,
      filename,
    };
  } catch (error) {
    console.error('Video upload error:', error);
    return {
      success: false,
      error: 'Failed to upload video',
    };
  }
}

// Upload multiple files
export async function uploadMultipleFiles(
  files: File[],
  type: 'profile' | 'portfolio' | 'video',
  userId?: string
): Promise<UploadResult[]> {
  const uploadFn =
    type === 'profile'
      ? uploadProfilePhoto
      : type === 'portfolio'
      ? uploadPortfolioImage
      : uploadVideo;

  const results = await Promise.all(files.map((file) => uploadFn(file, userId)));
  return results;
}
