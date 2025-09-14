'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Play, ImageIcon, Video, FileText, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { DynamicProgressTracker } from '@/components/DynamicProgressTracker';

type FileType = 'image' | 'video' | 'document';

interface UploadedFile {
  id: string;
  file: File;
  type: FileType;
  preview?: string;
  uploading?: boolean;
  error?: string;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export default function SignupStep3() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<UploadedFile | null>(null);
  const [demoReel, setDemoReel] = useState<UploadedFile | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<UploadedFile[]>([]);
  const [resume, setResume] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepData, setStepData] = useState<any>(null);

  // Load previous step data
  useEffect(() => {
    const savedProgress = localStorage.getItem('signup_progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      if (progress.step >= 2) {
        setStepData(progress.data);
      } else {
        router.push('/auth/signup/step-1');
      }
    } else {
      router.push('/auth/signup/step-1');
    }
  }, [router]);

  const generateFileId = () => Math.random().toString(36).substring(2, 9);

  const getAcceptedTypes = (type: FileType) => {
    if (type === 'image') return ACCEPTED_IMAGE_TYPES;
    if (type === 'video') return ACCEPTED_VIDEO_TYPES;
    return ACCEPTED_DOCUMENT_TYPES;
  };

  const handleFileUpload = async (file: File, type: FileType, setterFunction: (file: UploadedFile | null) => void) => {
    const acceptedTypes = getAcceptedTypes(type);
    const maxSize = type === 'video' ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;

    if (!acceptedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [type]: `Please select a valid ${type} file` }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [type]: `File size must be less than ${maxSize / 1024 / 1024}MB` }));
      return;
    }

    const fileId = generateFileId();
    const uploadedFile: UploadedFile = {
      id: fileId,
      file,
      type,
      uploading: true
    };

    // Create preview for images
    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedFile.preview = e.target?.result as string;
        setterFunction({ ...uploadedFile });
      };
      reader.readAsDataURL(file);
    } else {
      setterFunction(uploadedFile);
    }

    // Simulate upload
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
    setterFunction(null);
      setErrors(prev => ({ ...prev, [type]: '' }));
    } catch (error) {
  setterFunction(null);
    }
  };

  const handlePortfolioUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const newFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      if (portfolioFiles.length + newFiles.length >= 5) {
        setErrors(prev => ({ ...prev, portfolio: 'Maximum 5 portfolio files allowed' }));
        break;
      }

      const fileType: FileType = file.type.startsWith('image/') ? 'image' : 
                                file.type.startsWith('video/') ? 'video' : 'document';
      
      const acceptedTypes = getAcceptedTypes(fileType);
      
      if (!acceptedTypes.includes(file.type)) {
        continue;
      }

      const fileId = generateFileId();
      const uploadedFile: UploadedFile = {
        id: fileId,
        file,
        type: fileType,
        uploading: true
      };

      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadedFile);
    }

    setPortfolioFiles(prev => [...prev, ...newFiles]);

    // Simulate uploads
    for (const file of newFiles) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPortfolioFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, uploading: false } : f)
        );
      } catch (error) {
        setPortfolioFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, uploading: false, error: 'Upload failed' } : f)
        );
      }
    }
  };

  const removePortfolioFile = (id: string) => {
    setPortfolioFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Final registration data
      const registrationData = {
        ...stepData,
        profilePhoto: profilePhoto?.file,
        demoReel: demoReel?.file,
        portfolioFiles: portfolioFiles.map(f => f.file),
        resume: resume?.file
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear signup progress
      localStorage.removeItem('signup_progress');

      // Redirect to success page
      router.push('/auth/signup/success');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = profilePhoto && !profilePhoto.uploading;

  if (!stepData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar for consistency with homepage */}
      <div className="fixed top-0 left-0 w-60 h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-red-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">3Y</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">3YESES</span>
        </Link>
        <nav className="space-y-4">
          <Link href="/auth/signup/step-2" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-red-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Step 2</span>
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="md:ml-60 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/auth/signup/step-2" className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">3Y</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">3YESES</span>
            </Link>
          </div>
        </header>

        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Portfolio & Media
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Upload your profile photo and showcase your work
            </p>
          </div>

          {/* Form Container */}
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
            <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
              
              {/* Step Indicator - Dynamic Progress Tracker */}
              <DynamicProgressTracker 
                currentStep={3}
                totalSteps={3}
                stepLabels={['Account', 'Profile', 'Upload']}
              />

              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Photo - Required */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Profile Photo <span className="text-red-500">*</span>
                  </div>
                  
                  {!profilePhoto ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="profile-photo" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Upload a professional profile photo
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, WEBP up to 10MB
                          </span>
                        </label>
                        <input
                          id="profile-photo"
                          type="file"
                          className="sr-only"
                          accept={ACCEPTED_IMAGE_TYPES.join(',')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'image', setProfilePhoto);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                        {profilePhoto.preview && (
                          <Image
                            src={profilePhoto.preview}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {profilePhoto.uploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfilePhoto(null)}
                        className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {errors.image && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.image}</p>}
                </div>

                {/* Demo Reel - Optional */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Demo Reel (Recommended for Talent)
                    <span className="ml-2 text-xs text-blue-600">Optional but highly recommended to showcase your skills</span>
                  </div>
                  
                  {!demoReel ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <Video className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="demo-reel" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Upload your demo reel
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            MP4, MOV up to 50MB
                          </span>
                        </label>
                        <input
                          id="demo-reel"
                          type="file"
                          className="sr-only"
                          accept={ACCEPTED_VIDEO_TYPES.join(',')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'video', setDemoReel);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <Play className="h-8 w-8 text-blue-600 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{demoReel.file.name}</p>
                          <p className="text-xs text-gray-500">{(demoReel.file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        {demoReel.uploading && (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        )}
                        <button
                          type="button"
                          onClick={() => setDemoReel(null)}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {errors.video && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.video}</p>}
                </div>

                {/* Portfolio Files - Optional */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Portfolio Files (Optional)
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="mt-3">
                      <label htmlFor="portfolio-files" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                          Upload portfolio files
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          Images, videos, or PDFs up to 5 files
                        </span>
                      </label>
                      <input
                        id="portfolio-files"
                        type="file"
                        multiple
                        className="sr-only"
                        accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, ...ACCEPTED_DOCUMENT_TYPES].join(',')}
                        onChange={(e) => {
                          if (e.target.files) handlePortfolioUpload(e.target.files);
                        }}
                      />
                    </div>
                  </div>

                  {/* Portfolio File List */}
                  {portfolioFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {portfolioFiles.map((file) => (
                        <div key={file.id} className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          {file.type === 'image' ? (
                            <ImageIcon className="h-6 w-6 text-blue-600 mr-3" />
                          ) : file.type === 'video' ? (
                            <Video className="h-6 w-6 text-purple-600 mr-3" />
                          ) : (
                            <FileText className="h-6 w-6 text-red-600 mr-3" />
                          )}
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{file.file.name}</p>
                            <p className="text-xs text-gray-500">{(file.file.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                          
                          {file.uploading && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => removePortfolioFile(file.id)}
                            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {errors.portfolio && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.portfolio}</p>}
                </div>

                {/* Resume - Optional */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Resume/CV (Optional)
                  </div>
                  
                  {!resume ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="resume" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                            Upload your resume
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PDF up to 10MB
                          </span>
                        </label>
                        <input
                          id="resume"
                          type="file"
                          className="sr-only"
                          accept={ACCEPTED_DOCUMENT_TYPES.join(',')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'document', setResume);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-red-600 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{resume.file.name}</p>
                          <p className="text-xs text-gray-500">{(resume.file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        {resume.uploading && (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        )}
                        <button
                          type="button"
                          onClick={() => setResume(null)}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {errors.document && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.document}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={!canProceed || loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-red-500 hover:from-blue-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Completing Registration...
                      </div>
                    ) : (
                      <>
                        Complete Registration
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                  
                  {!canProceed && (
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Please upload a profile photo to continue
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
