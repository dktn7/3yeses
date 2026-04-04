'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  description?: string;
}

interface Location {
  id: number;
  displayName: string;
  fullName: string;
  city: string;
  country: string;
}

interface LanguageItem {
  name: string;
  proficiency: string;
}

interface FormErrors {
  category?: string;
  subcategory?: string;
  bio?: string;
  location?: string;
  experienceLevel?: string;
  dateOfBirth?: string;
  gender?: string;
  ethnicity?: string;
  bodyType?: string;
  languages?: string;
}

export default function SignupStep2() {
  const router = useRouter();
  const t = useTranslations('Auth.signup');
  
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    bio: '',
    location: '',
    experienceLevel: '',
    skills: [] as string[],
    dateOfBirth: '',
    gender: '',
    genderOther: '',
    ethnicity: '',
    ethnicityOther: '',
    bodyType: '',
    languages: [] as LanguageItem[],
    disabilities: [] as string[],
    disabilityOther: ''
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState({ name: '', proficiency: 'FLUENT' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Account type from step 1
  const [accountType, setAccountType] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [isMinor, setIsMinor] = useState<boolean>(false);
  
  // Categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Location autocomplete
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    // Check if Step 1 data exists
    const step1Data = sessionStorage.getItem('signupStep1');
    if (!step1Data) {
      router.push('/auth/signup/steps/step-1');
      return;
    }

    // Get account type and child info from step 1
    try {
      const step1 = JSON.parse(step1Data);
      setAccountType(step1.accountType || 'SELF');
      setIsMinor(step1.isMinor || false);
      
      // For parent-managed accounts, get child's name
      if (step1.accountType === 'PARENT_MANAGED') {
        setChildName(`${step1.childFirstName || ''} ${step1.childLastName || ''}`.trim());
        // Pre-fill dateOfBirth from childDateOfBirth
        setFormData(prev => ({ ...prev, dateOfBirth: step1.childDateOfBirth || '' }));
      } else if (step1.accountType === 'SELF' || step1.accountType === 'SELF_WITH_CONSENT') {
        // Pre-fill dateOfBirth from step 1
        setFormData(prev => ({ ...prev, dateOfBirth: step1.dateOfBirth || '' }));
      }
    } catch (error) {
      console.error('Error parsing step1 data:', error);
    }

    // Load saved Step 2 data if exists
    const step2Data = sessionStorage.getItem('signupStep2');
    if (step2Data) {
      try {
        const saved = JSON.parse(step2Data);
        setFormData(saved);
        setLocationQuery(saved.location || '');
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }

    // Fetch categories from API
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const { success, data } = await response.json();
      if (success && data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Debounced location search
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setLoadingLocations(true);
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      const { success, data } = await response.json();
      if (success && data) {
        setLocationSuggestions(data);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  // Debounce location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationQuery) {
        searchLocations(locationQuery);
      } else {
        setLocationSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationQuery, searchLocations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.location-autocomplete')) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const experienceLevels = [
    'Beginner (0-2 years)',
    'Intermediate (3-5 years)',
    'Advanced (6-10 years)',
    'Expert (10+ years)'
  ];

  const genderOptions = [
    { value: 'MALE', label: t('genderMale') },
    { value: 'FEMALE', label: t('genderFemale') },
    { value: 'NON_BINARY', label: t('genderNonBinary') },
    { value: 'PREFER_NOT_TO_SAY', label: t('genderPreferNotToSay') },
    { value: 'OTHER', label: t('genderOther') }
  ];

  const ethnicityOptions = [
    { value: 'WHITE_CAUCASIAN', label: t('ethnicityWhite') },
    { value: 'BLACK_AFRICAN', label: t('ethnicityBlack') },
    { value: 'ASIAN', label: t('ethnicityAsian') },
    { value: 'HISPANIC_LATINO', label: t('ethnicityHispanic') },
    { value: 'MIDDLE_EASTERN', label: t('ethnicityMiddleEastern') },
    { value: 'MIXED_MULTIRACIAL', label: t('ethnicityMixed') },
    { value: 'NATIVE_AMERICAN', label: t('ethnicityNative') },
    { value: 'PACIFIC_ISLANDER', label: t('ethnicityPacific') },
    { value: 'PREFER_NOT_TO_SAY', label: t('ethnicityPreferNotToSay') },
    { value: 'OTHER', label: t('ethnicityOther') }
  ];

  const bodyTypeOptions = [
    { value: 'SLIM', label: t('bodyTypeSlim') },
    { value: 'AVERAGE', label: t('bodyTypeAverage') },
    { value: 'ATHLETIC', label: t('bodyTypeAthletic') },
    { value: 'CURVY', label: t('bodyTypeCurvy') },
    { value: 'PLUS_SIZE', label: t('bodyTypePlusSize') },
    { value: 'MUSCULAR', label: t('bodyTypeMuscular') },
    { value: 'PREFER_NOT_TO_SAY', label: t('bodyTypePreferNotToSay') }
  ];

  const proficiencyOptions = [
    { value: 'NATIVE', label: t('proficiencyNative') },
    { value: 'FLUENT', label: t('proficiencyFluent') },
    { value: 'INTERMEDIATE', label: t('proficiencyIntermediate') },
    { value: 'BASIC', label: t('proficiencyBasic') }
  ];

  const popularLocations = [
    'London, United Kingdom',
    'New York, NY, USA',
    'Los Angeles, CA, USA',
    'Paris, France',
    'Sydney, Australia',
    'Berlin, Germany',
    'Tokyo, Japan',
    'Rome, Italy'
  ];

  const disabilityOptions = [
    { value: 'wheelchairUser', label: t('disabilityWheelchairUser') },
    { value: 'mobilityImpairment', label: t('disabilityMobilityImpairment') },
    { value: 'limbDifferenceAmputation', label: t('disabilityLimbDifferenceAmputation') },
    { value: 'deafHardOfHearing', label: t('disabilityDeafHardOfHearing') },
    { value: 'blindVisualImpairment', label: t('disabilityBlindVisualImpairment') },
    { value: 'neurodivergent', label: t('disabilityNeurodivergent') },
    { value: 'speechCommunicationDifference', label: t('disabilitySpeechCommunicationDifference') },
    { value: 'dwarfismShortStature', label: t('disabilityDwarfismShortStature') },
    { value: 'facialDifference', label: t('disabilityFacialDifference') },
    { value: 'chronicPainFatigue', label: t('disabilityChronicPainFatigue') },
    { value: 'invisibleDisability', label: t('disabilityInvisibleDisability') },
    { value: 'other', label: t('disabilityOther') },
    { value: 'nonePreferNotToSay', label: t('disabilityNonePreferNotToSay') }
  ];

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.id === formData.category);
  const availableSubcategories = selectedCategory?.subcategories || [];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category) {
      newErrors.category = t('errors.categoryRequired');
    }

    if (!formData.subcategory && availableSubcategories.length > 0) {
      newErrors.subcategory = 'Please select a subcategory';
    }

    // Bio is now optional - no validation needed

    if (!formData.location.trim()) {
      newErrors.location = t('errors.locationRequired');
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Please select your experience level';
    }

    // Validate date of birth - skip for parent-managed accounts (already validated in step 1)
    // For SELF and SELF_WITH_CONSENT, DOB is already validated in step 1
    // No need to re-validate here

    // Validate "Other" fields
    if (formData.gender === 'OTHER' && !formData.genderOther.trim()) {
      newErrors.gender = t('genderOtherSpecify');
    }

    if (formData.ethnicity === 'OTHER' && !formData.ethnicityOther.trim()) {
      newErrors.ethnicity = t('ethnicityOtherSpecify');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Store data in session storage for step 3
      sessionStorage.setItem('signupStep2', JSON.stringify(formData));
      
      // Navigate to step 3
      router.push('/auth/signup/steps/step-3');
    } catch (error) {
      console.error('Step 2 error:', error);
      setErrors({ category: t('errors.serverError') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | string[] | LanguageItem[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategory: '' // Reset subcategory when category changes
    }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const handleLocationSelect = (location: Location) => {
    setFormData(prev => ({ ...prev, location: location.displayName }));
    setLocationQuery(location.displayName);
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      handleChange('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    handleChange('skills', formData.skills.filter(s => s !== skill));
  };

  const addLanguage = () => {
    if (languageInput.name.trim()) {
      const exists = formData.languages.some(l => l.name.toLowerCase() === languageInput.name.toLowerCase());
      if (!exists) {
        handleChange('languages', [...formData.languages, { ...languageInput }]);
        setLanguageInput({ name: '', proficiency: 'FLUENT' });
      }
    }
  };

  const removeLanguage = (index: number) => {
    handleChange('languages', formData.languages.filter((_, i) => i !== index));
  };

  const handlePopularLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    setLocationQuery(location);
    setShowLocationDropdown(false);
  };

  const toggleDisability = (value: string) => {
    if (value === 'nonePreferNotToSay') {
      // If "None/Prefer not to say" is selected, clear all disabilities
      handleChange('disabilities', []);
      handleChange('disabilityOther', '');
    } else {
      // Remove "None/Prefer not to say" if selecting any disability
      const filtered = formData.disabilities.filter(d => d !== 'nonePreferNotToSay');
      
      if (filtered.includes(value)) {
        // Remove if already selected
        handleChange('disabilities', filtered.filter(d => d !== value));
        if (value === 'other') {
          handleChange('disabilityOther', '');
        }
      } else {
        // Add if not selected
        handleChange('disabilities', [...filtered, value]);
      }
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
            <li className="flex items-center"><span className="mx-2">/</span><span className="text-gray-900 dark:text-gray-100 font-medium">Step 2</span></li>
          </ol>
        </nav>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('step2Title')}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">2 / 3</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-red-600 h-2 rounded-full" style={{ width: '66.66%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Header with context based on account type */}
          <div className="text-center mb-8">
            {accountType === 'PARENT_MANAGED' && childName && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  Creating talent profile for <span className="font-semibold">{childName}</span>
                </p>
              </div>
            )}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-2">
              {t('step2Title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {accountType === 'PARENT_MANAGED' 
                ? "Tell us about your child's talent and experience"
                : t('step2Description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('category')} <span className="text-red-500">*</span>
              </label>
              {loadingCategories ? (
                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  Loading categories...
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
                >
                  <option value="">{t('categoryPlaceholder')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
            </div>

            {/* Subcategory (shown when category is selected) */}
            {formData.category && availableSubcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.subcategory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
                >
                  <option value="">Select a subcategory...</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subcategory && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subcategory}</p>}
              </div>
            )}

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('bio')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder={t('bioPlaceholder')}
                rows={5}
                className={`w-full px-4 py-3 rounded-lg border ${errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              <div className="flex justify-between mt-1">
                {errors.bio && <p className="text-sm text-red-600 dark:text-red-400">{errors.bio}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{formData.bio.length} / 500 characters</p>
              </div>
            </div>

            {/* Location with Autocomplete */}
            <div className="relative location-autocomplete">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('location')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setShowLocationDropdown(true);
                  handleChange('location', e.target.value);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                placeholder={t('locationPlaceholder')}
                className={`w-full px-4 py-3 rounded-lg border ${errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              {errors.location && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>}
              
              {/* Location Dropdown */}
              {showLocationDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {/* Popular Locations */}
                  {locationQuery.length === 0 && (
                    <>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750">
                        Popular Locations
                      </div>
                      {popularLocations.map((location) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => handlePopularLocationSelect(location)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                        >
                          {location}
                        </button>
                      ))}
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-600">
                        Or type to search for any location...
                      </div>
                    </>
                  )}
                  
                  {/* Search Results */}
                  {locationQuery.length > 0 && (
                    <>
                      {loadingLocations && (
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          Searching...
                        </div>
                      )}
                      {locationSuggestions.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => handleLocationSelect(location)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                        >
                          <div className="font-medium">{location.displayName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{location.fullName}</div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('experience')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => handleChange('experienceLevel', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${errors.experienceLevel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
              >
                <option value="">{t('experiencePlaceholder')}</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {errors.experienceLevel && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.experienceLevel}</p>}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('skills')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder={t('skillsPlaceholder')}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-600 dark:hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Attributes (Optional)</h3>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dateOfBirth')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateOfBirth}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('gender')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
              >
                <option value="">{t('genderPlaceholder')}</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {formData.gender === 'OTHER' && (
                <input
                  type="text"
                  value={formData.genderOther}
                  onChange={(e) => handleChange('genderOther', e.target.value)}
                  placeholder={t('genderOtherSpecify')}
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              )}
              {errors.gender && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>}
            </div>

            {/* Ethnicity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('ethnicity')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span>
              </label>
              <select
                value={formData.ethnicity}
                onChange={(e) => handleChange('ethnicity', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${errors.ethnicity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
              >
                <option value="">{t('ethnicityPlaceholder')}</option>
                {ethnicityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {formData.ethnicity === 'OTHER' && (
                <input
                  type="text"
                  value={formData.ethnicityOther}
                  onChange={(e) => handleChange('ethnicityOther', e.target.value)}
                  placeholder={t('ethnicityOtherSpecify')}
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              )}
              {errors.ethnicity && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ethnicity}</p>}
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('bodyType')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span>
              </label>
              <select
                value={formData.bodyType}
                onChange={(e) => handleChange('bodyType', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${errors.bodyType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all`}
              >
                <option value="">{t('bodyTypePlaceholder')}</option>
                {bodyTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.bodyType && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bodyType}</p>}
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('languages')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span>
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={languageInput.name}
                    onChange={(e) => setLanguageInput(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('languageNamePlaceholder')}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <select
                    value={languageInput.proficiency}
                    onChange={(e) => setLanguageInput(prev => ({ ...prev, proficiency: e.target.value }))}
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {proficiencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    {t('addLanguage')}
                  </button>
                </div>
                
                {formData.languages.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{lang.name}</span>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            ({proficiencyOptions.find(p => p.value === lang.proficiency)?.label})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('removeLanguage')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.languages && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.languages}</p>}
            </div>

            {/* Disabilities (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('disability')} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional')})</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {t('disabilityDescription')}
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-750">
                {disabilityOptions.map(option => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.disabilities.includes(option.value)}
                      onChange={() => toggleDisability(option.value)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
              
              {/* Other Disability Specification */}
              {formData.disabilities.includes('other') && (
                <input
                  type="text"
                  value={formData.disabilityOther}
                  onChange={(e) => handleChange('disabilityOther', e.target.value)}
                  placeholder={t('disabilityOtherSpecify')}
                  className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              )}
              
              {/* Selected Disabilities Display */}
              {formData.disabilities.length > 0 && !formData.disabilities.includes('nonePreferNotToSay') && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.disabilities.map(disability => {
                    const option = disabilityOptions.find(o => o.value === disability);
                    return (
                      <span
                        key={disability}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {option?.label}
                        <button
                          type="button"
                          onClick={() => toggleDisability(disability)}
                          className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href="/auth/signup/steps/step-1"
                className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-center"
              >
                {t('back')}
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : t('next')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
