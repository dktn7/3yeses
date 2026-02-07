'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, File, Image, Video, Music } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (urls: string[]) => void;
  accept?: 'image' | 'video' | 'audio' | 'all';
  maxFiles?: number;
  maxSizeMB?: number;
  multiple?: boolean;
}

interface UploadFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export default function FileUpload({
  onUploadComplete,
  accept = 'all',
  maxFiles = 10,
  maxSizeMB = 100,
  multiple = true,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedTypes = () => {
    switch (accept) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      default:
        return 'image/*,video/*,audio/*';
    }
  };

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'other';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (type.startsWith('audio/')) return <Music className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB`;
    }

    // Check file type
    const fileType = getFileType(file);
    if (accept !== 'all' && fileType !== accept) {
      return `Invalid file type. Expected ${accept}`;
    }

    return null;
  };

  const handleFiles = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: UploadFile[] = [];
      const currentFileCount = files.length;

      for (let i = 0; i < selectedFiles.length; i++) {
        if (currentFileCount + newFiles.length >= maxFiles) {
          alert(`Maximum ${maxFiles} files allowed`);
          break;
        }

        const file = selectedFiles[i];
        const error = validateFile(file);

        const uploadFile: UploadFile = {
          file,
          progress: 0,
          status: error ? 'error' : 'pending',
          error: error || undefined,
        };

        // Create preview for images
        if (file.type.startsWith('image/')) {
          uploadFile.preview = URL.createObjectURL(file);
        }

        newFiles.push(uploadFile);
      }

      setFiles((prev) => [...prev, ...newFiles]);

      // Auto-upload valid files
      newFiles.forEach((uploadFile, index) => {
        if (uploadFile.status === 'pending') {
          uploadSingleFile(files.length + index, uploadFile);
        }
      });
    },
    [files, maxFiles]
  );

  const uploadSingleFile = async (index: number, uploadFile: UploadFile) => {
    try {
      // Update status to uploading
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: 'uploading', progress: 0 };
        return updated;
      });

      const formData = new FormData();
      formData.append('file', uploadFile.file);
      
      const fileType = getFileType(uploadFile.file);
      formData.append('type', fileType === 'image' ? 'portfolio' : fileType);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], progress };
            return updated;
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFiles((prev) => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              status: 'success',
              progress: 100,
              url: response.url || response.urls?.[0],
            };
            return updated;
          });
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        setFiles((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'error',
            error: 'Upload failed',
          };
          return updated;
        });
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      setFiles((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        };
        return updated;
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview!);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleComplete = () => {
    const successfulUploads = files
      .filter((f) => f.status === 'success' && f.url)
      .map((f) => f.url!);

    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads);
    }
  };

  const allComplete = files.length > 0 && files.every((f) => f.status === 'success' || f.status === 'error');
  const successCount = files.filter((f) => f.status === 'success').length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={getAcceptedTypes()}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {accept === 'all' ? 'Images, videos, or audio files' : `${accept} files only`} • Max {maxSizeMB}MB • Up to {maxFiles} files
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Files ({successCount}/{files.length} uploaded)
          </h4>

          <div className="space-y-2">
            {files.map((uploadFile, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {/* Icon/Preview */}
                <div className="flex-shrink-0">
                  {uploadFile.preview ? (
                    <img
                      src={uploadFile.preview}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500 dark:text-gray-400">
                      {getFileIcon(uploadFile.file.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(uploadFile.file.size)}
                  </p>

                  {/* Progress Bar */}
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadFile.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {uploadFile.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  )}
                  {uploadFile.status === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  {uploadFile.status === 'pending' && (
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Complete Button */}
          {allComplete && successCount > 0 && (
            <button
              onClick={handleComplete}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Complete Upload ({successCount} file{successCount !== 1 ? 's' : ''})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
