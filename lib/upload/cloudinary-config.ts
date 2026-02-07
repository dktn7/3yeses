import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

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
