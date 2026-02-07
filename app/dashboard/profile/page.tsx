'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import SkillsManager from '@/components/SkillsManager';
import WorkHistoryManager, { WorkHistoryItem } from '@/components/WorkHistoryManager';

interface TalentProfile {
  id: string;
  bio: string | null;
  location: string | null;
  experience: number | null;
  dateOfBirth: string | null;
  gender: string | null;
  genderOther: string | null;
  ethnicity: string | null;
  ethnicityOther: string | null;
  age: number | null;
  height: number | null;
  bodyType: string | null;
  eyeColor: string | null;
  hairColor: string | null;
  skills: string[];
  featuredSkills: string[]; // Skills to display on profile card (max 4)
  workHistory: WorkHistoryItem[];
  disabilities: string[];
  disabilityOther: string | null;
  avatarUrl: string | null;
  videoUrl: string | null;
  portfolioImages: string[];
  videoUrls: string[];
  socialMedia: any;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/talent/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile || getDefaultProfile());
      } else if (response.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/auth/signin';
      } else {
        setProfile(getDefaultProfile());
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(getDefaultProfile());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultProfile = (): TalentProfile => ({
    id: '',
    bio: '',
    location: '',
    experience: 0,
    dateOfBirth: '',
    gender: '',
    genderOther: '',
    ethnicity: '',
    ethnicityOther: '',
    age: null,
    height: null,
    bodyType: '',
    eyeColor: '',
    hairColor: '',
    skills: [],
    featuredSkills: [],
    workHistory: [],
    disabilities: [],
    disabilityOther: '',
    avatarUrl: '',
    videoUrl: '',
    portfolioImages: [],
    videoUrls: [],
    socialMedia: {},
  });

  const handleInputChange = (field: string, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile?.bio || profile.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (!profile?.location) {
      newErrors.location = 'Location is required';
    }

    if (profile?.experience === null || (profile && profile.experience < 0)) {
      newErrors.experience = 'Experience must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/talent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else if (response.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/auth/signin';
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your talent profile information to help you get discovered
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 dark:text-green-400 text-xl mr-3">✓</span>
            <p className="text-green-800 dark:text-green-300 font-medium">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">⚠</span>
            <p className="text-red-800 dark:text-red-300 font-medium">{errors.submit}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Current Avatar Display */}
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                  <span className="text-white text-4xl font-bold">
                    {profile.bio ? profile.bio.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Change Profile Picture
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={profile.avatarUrl || ''}
                  onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                />
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('avatarUrl', '')}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Recommended: Square image, at least 400x400px. Supports JPG, PNG, GIF.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red ${
                  errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Tell us about yourself, your experience, and what makes you unique..."
              />
              {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {profile.bio?.length || 0} / 500 characters (minimum 50)
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red ${
                  errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., London, UK"
              />
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={profile.experience ?? ''}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red ${
                  errors.experience ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
              />
              {errors.experience && <p className="mt-1 text-sm text-red-500">{errors.experience}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={profile.dateOfBirth?.split('T')[0] || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
              />
            </div>
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Physical Characteristics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                value={profile.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={profile.height ?? ''}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value) || null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                placeholder="e.g., 175"
              />
            </div>

            {/* Ethnicity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ethnicity
              </label>
              <select
                value={profile.ethnicity || ''}
                onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
              >
                <option value="">Select ethnicity</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="asian">Asian</option>
                <option value="hispanic">Hispanic</option>
                <option value="middle-eastern">Middle Eastern</option>
                <option value="mixed">Mixed</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Type
              </label>
              <select
                value={profile.bodyType || ''}
                onChange={(e) => handleInputChange('bodyType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
              >
                <option value="">Select body type</option>
                <option value="slim">Slim</option>
                <option value="athletic">Athletic</option>
                <option value="average">Average</option>
                <option value="muscular">Muscular</option>
                <option value="curvy">Curvy</option>
                <option value="plus-size">Plus Size</option>
              </select>
            </div>

            {/* Eye Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Eye Color
              </label>
              <input
                type="text"
                value={profile.eyeColor || ''}
                onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                placeholder="e.g., Brown, Blue, Green"
              />
            </div>

            {/* Hair Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hair Color
              </label>
              <input
                type="text"
                value={profile.hairColor || ''}
                onChange={(e) => handleInputChange('hairColor', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                placeholder="e.g., Black, Blonde, Brown"
              />
            </div>
          </div>
        </div>

        {/* Skills & Expertise */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Skills & Expertise
          </h2>
          
          <SkillsManager
            skills={profile.skills || []}
            onUpdate={(newSkills) => handleInputChange('skills', newSkills)}
          />

          {/* Featured Skills Selector */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Featured Skills
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Choose up to 4 skills to display on your profile card
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {(profile.featuredSkills || []).length}/4 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => {
                  const isSelected = (profile.featuredSkills || []).includes(skill);
                  const canSelect = (profile.featuredSkills || []).length < 4 || isSelected;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          // Remove from featured
                          handleInputChange('featuredSkills', 
                            (profile.featuredSkills || []).filter(s => s !== skill)
                          );
                        } else if (canSelect) {
                          // Add to featured
                          handleInputChange('featuredSkills', 
                            [...(profile.featuredSkills || []), skill]
                          );
                        }
                      }}
                      disabled={!canSelect && !isSelected}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 dark:bg-red-500 text-white shadow-md ring-2 ring-blue-300 dark:ring-red-300'
                          : canSelect
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      {isSelected && <span className="mr-1">✓</span>}
                      {skill}
                    </button>
                  );
                })}
              </div>
              {(profile.featuredSkills || []).length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  💡 Tip: Select your top skills to highlight them on your profile card
                </p>
              )}
            </div>
          )}
        </div>

        {/* Work History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <WorkHistoryManager
            items={profile.workHistory || []}
            onUpdate={(newItems) => handleInputChange('workHistory', newItems)}
          />
        </div>

        {/* Social Media */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Media</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={profile.socialMedia?.instagram || ''}
                onChange={(e) => handleInputChange('socialMedia', { ...profile.socialMedia, instagram: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter / X
              </label>
              <input
                type="text"
                value={profile.socialMedia?.twitter || ''}
                onChange={(e) => handleInputChange('socialMedia', { ...profile.socialMedia, twitter: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YouTube
              </label>
              <input
                type="text"
                value={profile.socialMedia?.youtube || ''}
                onChange={(e) => handleInputChange('socialMedia', { ...profile.socialMedia, youtube: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                placeholder="Channel URL"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
