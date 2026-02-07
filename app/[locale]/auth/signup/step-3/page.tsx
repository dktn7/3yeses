'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MdCloudUpload, MdDelete, MdImage, MdVideoLibrary } from 'react-icons/md';

interface VideoLink {
  id: string;
  url: string;
  type: 'url' | 'file';
  file?: File;
  preview?: string;
}

interface AudioFile {
  id: string;
  file: File;
  preview?: string;
}

export default function SignupStep3() {
  const router = useRouter();
  const t = useTranslations('Auth.signup');
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [portfolioPreview, setPortfolioPreview] = useState<string[]>([]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [videos, setVideos] = useState<VideoLink[]>([]);
  const [videoInput, setVideoInput] = useState('');
  const [uploadType, setUploadType] = useState<'url' | 'file'>('file');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  
  // Account type and child info
  const [accountType, setAccountType] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [mediaConsentGiven, setMediaConsentGiven] = useState<boolean>(false);

  useEffect(() => {
    // Check if previous steps data exists
    const step1Data = sessionStorage.getItem('signupStep1');
    const step2Data = sessionStorage.getItem('signupStep2');
    
    if (!step1Data || !step2Data) {
      router.push('/auth/signup/step-1');
      return;
    }

    // Get account type and child info from step 1
    try {
      const step1 = JSON.parse(step1Data);
      setAccountType(step1.accountType || 'SELF');
      
      // For parent-managed accounts, get child's name
      if (step1.accountType === 'PARENT_MANAGED') {
        setChildName(`${step1.childFirstName || ''} ${step1.childLastName || ''}`.trim());
      }
    } catch (error) {
      console.error('Error parsing step1 data:', error);
    }

    // Check if category is music or voice acting to show audio upload
    try {
      const step2 = JSON.parse(step2Data);
      const musicCategories = ['Music & Audio', 'Voice Over & Dubbing', 'Music Production'];
      setShowAudioUpload(musicCategories.some(cat => step2.category?.includes(cat)));
    } catch (error) {
      console.error('Error parsing step2 data:', error);
    }
  }, [router]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile photo must be less than 5MB');
        return;
      }
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (portfolioImages.length + files.length > 10) {
      setError('Maximum 10 portfolio images allowed');
      return;
    }
    
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      setError('Some images were too large (max 5MB each)');
    }
    
    setPortfolioImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setError('');
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
    setPortfolioPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (audioFiles.length + files.length > 10) {
      setError('Maximum 10 audio files allowed');
      return;
    }
    
    // Validate each audio file
    const validFiles: File[] = [];
    let hasError = false;
    
    files.forEach(file => {
      // Check file size (max 50MB per audio)
      if (file.size > 50 * 1024 * 1024) {
        setError(`Audio file "${file.name}" is too large. Maximum size is 50MB.`);
        hasError = true;
        return;
      }
      
      // Check file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/flac'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i)) {
        setError(`Audio file "${file.name}" has an invalid format. Supported: MP3, WAV, M4A, AAC, OGG, FLAC`);
        hasError = true;
        return;
      }
      
      validFiles.push(file);
    });
    
    if (hasError) return;
    
    // Add audio files to state
    validFiles.forEach(file => {
      const audioUrl = URL.createObjectURL(file);
      setAudioFiles(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        file: file,
        preview: audioUrl
      }]);
    });
    
    setError('');
  };

  const removeAudioFile = (id: string) => {
    const audio = audioFiles.find(a => a.id === id);
    // Revoke object URL
    if (audio?.preview) {
      URL.revokeObjectURL(audio.preview);
    }
    setAudioFiles(prev => prev.filter(a => a.id !== id));
  };

  const addVideoLink = () => {
    if (!videoInput.trim()) return;
    
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/i;
    if (!urlPattern.test(videoInput)) {
      setError('Please enter a valid YouTube or Vimeo URL');
      return;
    }
    
    if (videos.length >= 5) {
      setError('Maximum 5 videos allowed');
      return;
    }
    
    setVideos(prev => [...prev, { 
      id: Date.now().toString(), 
      url: videoInput,
      type: 'url'
    }]);
    setVideoInput('');
    setError('');
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (videos.length + files.length > 5) {
      setError('Maximum 5 videos allowed');
      return;
    }
    
    // Validate each video file
    const validFiles: File[] = [];
    let hasError = false;
    
    files.forEach(file => {
      // Check file size (max 100MB per video)
      if (file.size > 100 * 1024 * 1024) {
        setError(`Video "${file.name}" is too large. Maximum size is 100MB.`);
        hasError = true;
        return;
      }
      
      // Check file type
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/avi'];
      if (!validTypes.includes(file.type)) {
        setError(`Video "${file.name}" has an invalid format. Supported: MP4, MOV, AVI, WebM`);
        hasError = true;
        return;
      }
      
      validFiles.push(file);
    });
    
    if (hasError) return;
    
    // Add video files to state
    validFiles.forEach(file => {
      const videoUrl = URL.createObjectURL(file);
      setVideos(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        url: videoUrl,
        type: 'file',
        file: file,
        preview: videoUrl
      }]);
    });
    
    setError('');
  };

  const removeVideo = (id: string) => {
    const video = videos.find(v => v.id === id);
    // Revoke object URL if it's a file upload
    if (video?.type === 'file' && video.preview) {
      URL.revokeObjectURL(video.preview);
    }
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required profile photo
    if (!profilePhoto) {
      setError('Profile photo is required');
      return;
    }

    // Validate media consent for parent-managed accounts
    if (accountType === 'PARENT_MANAGED' && !mediaConsentGiven) {
      setError('You must confirm that you have permission to upload your child\'s photos and media');
      return;
    }

    setIsLoading(true);

    try {
      // Get data from previous steps
      const step1Data = JSON.parse(sessionStorage.getItem('signupStep1') || '{}');
      const step2Data = JSON.parse(sessionStorage.getItem('signupStep2') || '{}');

      // TODO: Upload files to storage service (e.g., AWS S3, Cloudinary)
      // For now, we'll just send file metadata
      const profilePhotoUrl = profilePhoto ? URL.createObjectURL(profilePhoto) : null;
      const portfolioUrls = portfolioImages.map(img => URL.createObjectURL(img));
      const audioUrls = audioFiles.map(audio => URL.createObjectURL(audio.file));
      const videoFileUrls = videos.filter(v => v.type === 'file' && v.file).map(v => URL.createObjectURL(v.file!));
      const videoLinkUrls = videos.filter(v => v.type === 'url').map(v => v.url);

      // Prepare complete signup data
      const signupData = {
        ...step1Data,
        ...step2Data,
        profilePhotoUrl,
        portfolioUrls,
        audioUrls,
        videoUrls: [...videoFileUrls, ...videoLinkUrls],
      };

      console.log('Complete signup data:', signupData);

      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Clear session storage
      sessionStorage.removeItem('signupStep1');
      sessionStorage.removeItem('signupStep2');

      // Redirect based on account type
      if (result.data.accountType === 'SELF_WITH_CONSENT') {
        // Teen with parental consent - show message about waiting for parent
        router.push(`/auth/consent-pending?email=${encodeURIComponent(result.data.email)}`);
      } else if (result.data.accountType === 'PARENT_MANAGED') {
        // Parent-managed account - redirect to verification
        router.push(`/auth/verify-email?email=${encodeURIComponent(result.data.email)}`);
      } else {
        // Regular account - redirect to verification
        router.push(`/auth/verify-email?email=${encodeURIComponent(result.data.email)}`);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : t('errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link></li>
            <li className="flex items-center"><span className="mx-2">/</span><Link href="/auth/signup" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign Up</Link></li>
            <li className="flex items-center"><span className="mx-2">/</span><span className="text-gray-900 dark:text-gray-100 font-medium">Step 3</span></li>
          </ol>
        </nav>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('step3Title')}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">3 / 3</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-red-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Header with context based on account type */}
          <div className="text-center mb-8">
            {accountType === 'PARENT_MANAGED' && childName && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  Uploading photos and media for <span className="font-semibold">{childName}</span>
                </p>
              </div>
            )}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-2">
              {t('step3Title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {accountType === 'PARENT_MANAGED' 
                ? "Upload photos and media showcasing your child's talent"
                : t('step3Description')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('profilePhoto')} <span className="text-red-500">*</span>
              </label>
              {profilePhotoPreview ? (
                <div className="relative inline-block">
                  <img src={profilePhotoPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-blue-600" />
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePhoto(null);
                      setProfilePhotoPreview('');
                    }}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <MdCloudUpload className="text-5xl text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('uploadPhoto')}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 5MB</span>
                  <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Portfolio Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('portfolio')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span> <span className="text-gray-500 text-xs">({portfolioImages.length}/10)</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-3">
                <MdImage className="text-4xl text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('uploadPortfolio')}</span>
                <input type="file" accept="image/*" multiple onChange={handlePortfolioChange} className="hidden" />
              </label>
              {portfolioPreview.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {portfolioPreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Portfolio ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removePortfolioImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Files (for Music/Voice categories) */}
            {showAudioUpload && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎵 Audio Files <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span> <span className="text-gray-500 text-xs">({audioFiles.length}/10)</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Upload audio samples to showcase your work (MP3, WAV, M4A, AAC, OGG, FLAC)
                </p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-3">
                  <MdCloudUpload className="text-4xl text-blue-600 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Upload Audio Files</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 50MB per file</span>
                  <input 
                    type="file" 
                    accept="audio/mpeg,audio/wav,audio/x-m4a,audio/aac,audio/ogg,audio/flac,.mp3,.wav,.m4a,.aac,.ogg,.flac" 
                    multiple 
                    onChange={handleAudioFileUpload} 
                    className="hidden" 
                  />
                </label>
                {audioFiles.length > 0 && (
                  <div className="space-y-2">
                    {audioFiles.map(audio => (
                      <div key={audio.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          🎵
                        </div>
                        {audio.preview && (
                          <audio 
                            src={audio.preview} 
                            controls 
                            className="flex-1 h-8"
                            style={{ maxWidth: '300px' }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-700 dark:text-gray-300 truncate">{audio.file.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {(audio.file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAudioFile(audio.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Video Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('videos')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span> <span className="text-gray-500 text-xs">({videos.length}/5)</span>
              </label>
              
              {/* Upload Type Toggle */}
              <div className="flex gap-2 mb-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadType === 'file'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  📤 Upload Video Files
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('url')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadType === 'url'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🔗 Add YouTube/Vimeo URL
                </button>
              </div>

              {/* File Upload Option */}
              {uploadType === 'file' && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-3">
                  <MdVideoLibrary className="text-4xl text-red-600 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Upload Video Files (MP4, MOV, AVI, WebM)</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 100MB per video</span>
                  <input 
                    type="file" 
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/avi" 
                    multiple 
                    onChange={handleVideoFileUpload} 
                    className="hidden" 
                  />
                </label>
              )}

              {/* URL Input Option */}
              {uploadType === 'url' && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoLink())}
                    placeholder={t('videoUrlPlaceholder')}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addVideoLink}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MdVideoLibrary size={20} />
                    {t('addVideo')}
                  </button>
                </div>
              )}

              {/* Video List */}
              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map(video => (
                    <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {/* Video Preview for uploaded files */}
                      {video.type === 'file' && video.preview && (
                        <video 
                          src={video.preview} 
                          className="w-20 h-14 object-cover rounded"
                          muted
                        />
                      )}
                      {/* Icon for URLs */}
                      {video.type === 'url' && (
                        <MdVideoLibrary className="text-red-600 text-2xl flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {video.type === 'file' ? (
                            <>
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">FILE</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{video.file?.name}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">URL</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{video.url}</span>
                            </>
                          )}
                        </div>
                        {video.type === 'file' && video.file && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(video.file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(video.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Media uploads are optional but highly recommended. You can always add them later from your profile.
              </p>
            </div>

            {/* Media Consent for Parent-Managed Accounts */}
            {accountType === 'PARENT_MANAGED' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mediaConsentGiven}
                    onChange={(e) => setMediaConsentGiven(e.target.checked)}
                    className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-yellow-900 dark:text-yellow-200">
                    <strong>Parental Consent Required:</strong> I confirm that I am the parent/legal guardian of {childName}, 
                    and I have the right to upload and share these photos and media. I understand that these images will be 
                    publicly visible on their talent profile. <span className="text-red-600 dark:text-red-400">*</span>
                  </span>
                </label>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href="/auth/signup/step-2"
                className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-center"
              >
                {t('back')}
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  t('submit')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
