'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Briefcase, MapPin, Clock, DollarSign, User, AlertCircle, CheckCircle, Lightbulb, Star } from 'lucide-react';
import { DynamicProgressTracker } from '@/components/DynamicProgressTracker';
// Inline category mapping helpers (temporarily) to avoid import resolution issues
const SIGNUP_CATEGORIES = [
  {
    value: 'actors',
    label: 'Actors',
    description: 'Actors and performers',
    skills: ['Acting', 'Improv', 'Voice']
  },
  {
    value: 'musicians',
    label: 'Musicians',
    description: 'Singers and musicians',
    skills: ['Singing', 'Guitar', 'Piano']
  }
];

function getSuggestedSkills(category: string) {
  const found = SIGNUP_CATEGORIES.find(c => c.value === category);
  return found ? found.skills : [];
}

function validateSkillsForCategory(_category: string, _skills: string[]) {
  return { isValid: true, suggestions: [], warnings: [] };
}

function findBestCategoryMatch(_category: string, _skills: string[], _bio: string) {
  return [] as { categoryName: string; reason: string; confidence: number }[];
}

const TALENT_CATEGORIES = SIGNUP_CATEGORIES.map((cat: { value: string; label: string; description?: string }) => ({
  value: cat.value,
  label: cat.label,
  description: cat.description
}));

const COMMON_SKILLS = SIGNUP_CATEGORIES.reduce((acc: Record<string, string[]>, cat: { value: string; skills: string[] }) => ({
  ...acc,
  [cat.value]: cat.skills
}), {} as Record<string, string[]>);

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Dutch', 'Other'
];

const POPULAR_LOCATIONS = [
  'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Atlanta, GA', 'Nashville, TN',
  'Las Vegas, NV', 'Miami, FL', 'Austin, TX', 'Seattle, WA', 'San Francisco, CA',
  'London, UK', 'Paris, France', 'Berlin, Germany', 'Toronto, Canada', 'Sydney, Australia'
];

export default function SignupStep2() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    professionalRole: '',
    category: '',
    bio: '',
    location: '',
    experience: '',
    age: '',
    skills: [] as string[],
    languages: [] as string[],
    ratePerHour: '',
    customSkill: '',
    // Parent/Guardian fields for minors
    isMinor: false,
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationshipToMinor: '' as 'parent' | 'guardian' | 'other' | '',
    parentConsent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [step1Data, setStep1Data] = useState<any>(null);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  type LocalCategoryMatch = { categoryName: string; reason: string; confidence: number };
  const [categoryMatch, setCategoryMatch] = useState<LocalCategoryMatch | null>(null);
  const [skillValidation, setSkillValidation] = useState<{ isValid: boolean; suggestions: string[]; warnings: string[] } | null>(null);

  // Load step 1 data on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('signup_progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      if (progress.step >= 1 && progress.role === 'talent') {
        setStep1Data(progress);
      } else {
        router.push('/auth/signup/step-1');
      }
    } else {
      router.push('/auth/signup/step-1');
    }
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.professionalRole.trim()) {
      newErrors.professionalRole = 'Professional role is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Professional bio is required';
    } else if (formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.experience) {
      newErrors.experience = 'Experience level is required';
    }

    if (formData.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill';
    }

    if (formData.languages.length === 0) {
      newErrors.languages = 'Please select at least one language';
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (age < 13) {
        newErrors.age = 'Must be at least 13 years old to register';
      } else if (age > 100) {
        newErrors.age = 'Please enter a valid age';
      }
    }

    // Parent/Guardian validation for minors
    if (formData.isMinor) {
      if (!formData.parentName.trim()) {
        newErrors.parentName = 'Parent/Guardian name is required';
      }
      
      if (!formData.parentEmail.trim()) {
        newErrors.parentEmail = 'Parent/Guardian email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        newErrors.parentEmail = 'Please enter a valid email address';
      }
      
      if (!formData.parentPhone.trim()) {
        newErrors.parentPhone = 'Parent/Guardian phone is required';
      }
      
      if (!formData.relationshipToMinor) {
        newErrors.relationshipToMinor = 'Please select relationship type';
      }
      
      if (!formData.parentConsent) {
        newErrors.parentConsent = 'Parent/Guardian consent is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Save progress to localStorage
      const updatedProgress = {
        step: 2,
        data: { ...step1Data, ...formData }
      };
      localStorage.setItem('signup_progress', JSON.stringify(updatedProgress));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to step 3
      router.push('/auth/signup/step-3');
    } catch (error) {
      console.error('Signup step 2 error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const actualValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: actualValue }));
    
    // Check if user is under 18 when age changes
    if (name === 'age') {
      const ageNum = parseInt(value);
      const isMinor = ageNum < 18 && ageNum >= 13;
      setFormData(prev => ({ ...prev, isMinor }));
      
      if (isMinor) {
        // Show parent/guardian form
        console.log('Minor detected - parent/guardian information required');
      }
    }
    
    // Smart category matching when category changes
    if (name === 'category') {
      const matches = findBestCategoryMatch(value, formData.skills, formData.bio);
      setCategoryMatch(matches[0] || null);
      
      // Suggest relevant skills for this category
      setSuggestedSkills(getSuggestedSkills(value));
      
      // Validate current skills against new category
      if (formData.skills.length > 0) {
        const validation = validateSkillsForCategory(value, formData.skills);
        setSkillValidation(validation);
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
      
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
    
    // Re-validate skills for current category
    if (formData.category) {
      const validation = validateSkillsForCategory(formData.category, newSkills);
      setSkillValidation(validation);
    }
    
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
    
    if (errors.languages) {
      setErrors(prev => ({ ...prev, languages: '' }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: value }));
    
    if (value.length > 0) {
      const filtered = POPULAR_LOCATIONS.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setFilteredLocations(filtered);
      setShowLocationDropdown(filtered.length > 0);
    } else {
      setFilteredLocations([]);
      setShowLocationDropdown(false);
    }
    
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const handleAddCustomSkill = () => {
    if (formData.customSkill.trim() && !formData.skills.includes(formData.customSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.customSkill.trim()],
        customSkill: ''
      }));
    }
  };

  if (!step1Data) {
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
          <Link href="/auth/signup/step-1" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-red-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Step 1</span>
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="md:ml-60 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/auth/signup/step-1" className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
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
              Professional Profile
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Tell us about your professional background and expertise
            </p>
          </div>

          {/* Form Container */}
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
            <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
              
              {/* Step Indicator - Dynamic Progress Tracker */}
              <DynamicProgressTracker 
                currentStep={2}
                totalSteps={3}
                stepLabels={['Account', 'Profile', 'Upload']}
              />

              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {errors.general}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Professional Role */}
                <div>
                  <label htmlFor="professionalRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Professional Role <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="professionalRole"
                      name="professionalRole"
                      type="text"
                      required
                      value={formData.professionalRole}
                      onChange={handleChange}
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${
                        errors.professionalRole ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., Lead Actor, Jazz Singer, Choreographer"
                    />
                  </div>
                  {errors.professionalRole && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.professionalRole}</p>}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select your category</option>
                      {TALENT_CATEGORIES.map((cat: { value: string; label: string }) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.category && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.category}</p>}
                  
                  {/* Category Match Preview */}
                  {categoryMatch && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                            Great choice! You&apos;ll be listed under &quot;{categoryMatch.categoryName}&quot;
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            {categoryMatch.reason} ({categoryMatch.confidence}% match)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {formData.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Skills <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {COMMON_SKILLS[formData.category as keyof typeof COMMON_SKILLS]?.map((skill: string) => (
                        <label key={skill} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.skills.includes(skill) 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill)}
                            onChange={() => handleSkillToggle(skill)}
                            className="sr-only"
                          />
                          <CheckCircle className={`h-4 w-4 mr-2 ${formData.skills.includes(skill) ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className={`text-sm ${formData.skills.includes(skill) ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                            {skill}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Custom Skill Input */}
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={formData.customSkill}
                        onChange={(e) => setFormData(prev => ({ ...prev, customSkill: e.target.value }))}
                        placeholder="Add custom skill"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    {errors.skills && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.skills}</p>}
                    
                    {/* Skill Validation Warnings */}
                    {skillValidation && skillValidation.warnings.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                              Skill suggestions for better visibility:
                            </p>
                            {skillValidation.warnings.map((warning) => (
                              <p key={warning} className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                {warning}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Suggested Skills */}
                    {skillValidation && skillValidation.suggestions.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                              Popular skills for your category:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {skillValidation.suggestions.map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => handleSkillToggle(skill)}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700 transition-colors"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Add {skill}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Professional Bio <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      required
                      value={formData.bio}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${
                        errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Tell us about your professional background, experience, and what makes you unique..."
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 50 characters ({formData.bio.length}/50)</p>
                  </div>
                  {errors.bio && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.bio}</p>}
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="13"
                      max="100"
                      required
                      value={formData.age}
                      onChange={handleChange}
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${
                        errors.age ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your age"
                    />
                  </div>
                  {errors.age && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.age}</p>}
                  {formData.isMinor && (
                    <p className="mt-2 text-sm text-blue-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Since you&apos;re under 18, we&apos;ll need parent/guardian information below.
                    </p>
                  )}
                </div>

                {/* Parent/Guardian Information for Minors */}
                {formData.isMinor && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                      Parent/Guardian Information Required
                    </h3>
                    <div className="space-y-4">
                      {/* Parent Name */}
                      <div>
                        <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Parent/Guardian Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="parentName"
                          name="parentName"
                          type="text"
                          required
                          value={formData.parentName}
                          onChange={handleChange}
                          className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter parent/guardian's full name"
                        />
                        {errors.parentName && <p className="mt-2 text-sm text-red-600">{errors.parentName}</p>}
                      </div>

                      {/* Parent Email */}
                      <div>
                        <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Parent/Guardian Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="parentEmail"
                          name="parentEmail"
                          type="email"
                          required
                          value={formData.parentEmail}
                          onChange={handleChange}
                          className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="parent@example.com"
                        />
                        {errors.parentEmail && <p className="mt-2 text-sm text-red-600">{errors.parentEmail}</p>}
                      </div>

                      {/* Parent Phone */}
                      <div>
                        <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Parent/Guardian Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="parentPhone"
                          name="parentPhone"
                          type="tel"
                          required
                          value={formData.parentPhone}
                          onChange={handleChange}
                          className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="+1 (555) 123-4567"
                        />
                        {errors.parentPhone && <p className="mt-2 text-sm text-red-600">{errors.parentPhone}</p>}
                      </div>

                      {/* Relationship */}
                      <div>
                        <label htmlFor="relationshipToMinor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Relationship to Talent <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="relationshipToMinor"
                          name="relationshipToMinor"
                          required
                          value={formData.relationshipToMinor}
                          onChange={handleChange}
                          className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select relationship</option>
                          <option value="parent">Parent</option>
                          <option value="guardian">Legal Guardian</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.relationshipToMinor && <p className="mt-2 text-sm text-red-600">{errors.relationshipToMinor}</p>}
                      </div>

                      {/* Parent Consent */}
                      <div>
                        <label className="flex items-start space-x-3">
                          <input
                            name="parentConsent"
                            type="checkbox"
                            checked={formData.parentConsent}
                            onChange={handleChange}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>I consent to my child/ward creating a talent profile and understand:</strong>
                            <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                              <li>I will have control over this account until they turn 18</li>
                              <li>All booking requests will be sent to my email</li>
                              <li>I can delete this account at any time</li>
                              <li>My child/ward&apos;s safety and privacy are protected</li>
                            </ul>
                          </span>
                        </label>
                        {errors.parentConsent && <p className="mt-2 text-sm text-red-600">{errors.parentConsent}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="relative">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={handleLocationChange}
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${
                        errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Start typing your city..."
                    />
                  </div>
                  
                  {/* Location Dropdown */}
                  {showLocationDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredLocations.map(location => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, location }));
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {errors.location && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.location}</p>}
                </div>

                {/* Experience Level */}
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experience Level <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="experience"
                      name="experience"
                      required
                      value={formData.experience}
                      onChange={handleChange}
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.experience ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner (0-2 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="experienced">Experienced (5-10 years)</option>
                      <option value="expert">Expert (10+ years)</option>
                    </select>
                  </div>
                  {errors.experience && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.experience}</p>}
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Languages <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {LANGUAGES.map(language => (
                      <label key={language} className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${
                        formData.languages.includes(language) 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}>
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(language)}
                          onChange={() => handleLanguageToggle(language)}
                          className="sr-only"
                        />
                        <CheckCircle className={`h-4 w-4 mr-2 ${formData.languages.includes(language) ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`text-sm ${formData.languages.includes(language) ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                          {language}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.languages && <p className="mt-2 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.languages}</p>}
                </div>

                {/* Rate */}
                <div>
                  <label htmlFor="ratePerHour" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hourly Rate (Optional)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="ratePerHour"
                      name="ratePerHour"
                      type="number"
                      min="0"
                      value={formData.ratePerHour}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 50"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Leave blank if you prefer to negotiate rates per project</p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-red-500 hover:from-blue-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving Progress...
                      </div>
                    ) : (
                      <>
                        Continue to Media Upload
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
