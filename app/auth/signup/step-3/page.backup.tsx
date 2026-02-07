'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MdCloudUpload, MdDelete, MdImage, MdVideoLibrary } from 'react-icons/md';

interface VideoLink {
  id: string;
  url: string;
}

export default function SignupStep3() {
  const router = useRouter();
  const t = useTranslations('Auth.signup');
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [portfolioPreview, setPortfolioPreview] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([]);
  const [videoInput, setVideoInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if previous steps data exists
    const step1Data = sessionStorage.getItem('signupStep1');
    const step2Data = sessionStorage.getItem('signupStep2');
    
    if (!step1Data || !step2Data) {
      router.push('/auth/signup/step-1');
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

  const addVideoLink = () => {
    if (!videoInput.trim()) return;
    
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/i;
    if (!urlPattern.test(videoInput)) {
      setError('Please enter a valid YouTube or Vimeo URL');
      return;
    }
    
    if (videoLinks.length >= 5) {
      setError('Maximum 5 video links allowed');
      return;
    }
    
    setVideoLinks(prev => [...prev, { id: Date.now().toString(), url: videoInput }]);
    setVideoInput('');
    setError('');
  };

  const removeVideoLink = (id: string) => {
    setVideoLinks(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Get data from previous steps
      const step1Data = JSON.parse(sessionStorage.getItem('signupStep1') || '{}');
      const step2Data = JSON.parse(sessionStorage.getItem('signupStep2') || '{}');

      // In a real app, you would upload files to storage and create the user account
      const signupData = {
        ...step1Data,
        ...step2Data,
        profilePhoto: profilePhoto?.name,
        portfolioCount: portfolioImages.length,
        videoLinks: videoLinks.map(v => v.url)
      };

      console.log('Complete signup data:', signupData);

      // TODO: API call to create account
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   body: formData // Use FormData for file uploads
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear session storage
      sessionStorage.removeItem('signupStep1');
      sessionStorage.removeItem('signupStep2');

      // Redirect to email verification
      router.push(`/auth/verify-email?email=${encodeURIComponent(step1Data.email)}`);
    } catch (err) {
      console.error('Signup error:', err);
      setError(t('errors.serverError'));
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-2">
              {t('step3Title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t('step3Description')}</p>
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
                {t('profilePhoto')}
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
                {t('portfolio')} <span className="text-gray-500 text-xs">({portfolioImages.length}/10)</span>
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

            {/* Video Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('videos')} <span className="text-gray-500 text-xs">({videoLinks.length}/5)</span>
              </label>
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
              {videoLinks.length > 0 && (
                <div className="space-y-2">
                  {videoLinks.map(video => (
                    <div key={video.id} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <MdVideoLibrary className="text-red-600 text-xl flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{video.url}</span>
                      <button
                        type="button"
                        onClick={() => removeVideoLink(video.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
