'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { getCategoryData } from '@/lib/data.ts'
import { Search, MapPin, ChevronDown, Users, Star, TrendingUp, UserPlus, Image as LucideImage, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import SwoopingTick from './SwoopingTick.tsx'
import DynamicHeadline from './DynamicHeadline.tsx'
import VideoHero from './VideoHero'
import RangeSlider from './RangeSlider.tsx'
import MultiSelect from './MultiSelect.tsx'
import FeatureHighlights from './FeatureHighlights.tsx'
import HeroSlideshow from './HeroSlideshow.tsx'
import TalentFilterPanel, { TalentFilters, defaultFilters } from './TalentFilterPanel'

export default function LandingClient({ t = (k: any) => k, locale = 'en-gb' }: { t?: any; locale?: string }) {
  // State declarations

  // Map subcategory to gender (memoized)
  const subcategoryGenderMap = useMemo(() => ({
    'female-actor': 'female',
    'male-actor': 'male',
    'non-binary-actor': 'non-binary',
    'child-actor': '', // No gender auto-select for child
  } as Record<string, string>), []);

  const ethnicityOptions = [
    { label: 'Asian', value: 'Asian' },
    { label: 'Black', value: 'Black' },
    { label: 'Hispanic/Latino', value: 'Hispanic/Latino' },
    { label: 'Middle Eastern', value: 'Middle Eastern' },
    { label: 'Native American', value: 'Native American' },
    { label: 'Pacific Islander', value: 'Pacific Islander' },
    { label: 'White', value: 'White' },
    { label: 'Mixed', value: 'Mixed' },
    { label: 'Other', value: 'Other' },
  ];
  const skillsOptions = [
    { label: 'Singing', value: 'Singing' },
    { label: 'Dancing', value: 'Dancing' },
    { label: 'Acting', value: 'Acting' },
    { label: 'Modeling', value: 'Modeling' },
    { label: 'Directing', value: 'Directing' },
    { label: 'Writing', value: 'Writing' },
    { label: 'Photography', value: 'Photography' },
    { label: 'Other', value: 'Other' },
  ];
  const languageOptions = [
    { label: 'English', value: 'English' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'French', value: 'French' },
    { label: 'German', value: 'German' },
    { label: 'Mandarin', value: 'Mandarin' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'Arabic', value: 'Arabic' },
    { label: 'Other', value: 'Other' },
  ];

  const eyeColorOptions = [
    { label: 'Amber', value: 'Amber' },
    { label: 'Blue', value: 'Blue' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Gray', value: 'Gray' },
    { label: 'Green', value: 'Green' },
    { label: 'Hazel', value: 'Hazel' },
    { label: 'Red', value: 'Red' },
    { label: 'Violet', value: 'Violet' },
    { label: 'Other', value: 'Other' },
  ];

  const hairColorOptions = [
    { label: 'Auburn', value: 'Auburn' },
    { label: 'Black', value: 'Black' },
    { label: 'Blonde', value: 'Blonde' },
    { label: 'Brown', value: 'Brown' },
    { label: 'Gray', value: 'Gray' },
    { label: 'Red', value: 'Red' },
    { label: 'White', value: 'White' },
    { label: 'Other', value: 'Other' },
  ];

  // const { user } = useAuth() // No longer needed here
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState<string[]>([])
  const [bodyType, setBodyType] = useState<string[]>([])
  const [ethnicity, setEthnicity] = useState<string>('')
  const [minAge, setMinAge] = useState<number | ''>('')
  const [maxAge, setMaxAge] = useState<number | ''>('')
  const [minExp, setMinExp] = useState<number | ''>('')
  const [maxExp, setMaxExp] = useState<number | ''>('')
  const [minHeight, setMinHeight] = useState<number | ''>('')
  const [maxHeight, setMaxHeight] = useState<number | ''>('')
  const [eyeColor, setEyeColor] = useState<string>('')
  const [hairColor, setHairColor] = useState<string>('')
  const [skills, setSkills] = useState<string>('')
  const [languages, setLanguages] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  // Removed isProfileOpen and isNotificationOpen, now handled globally
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [hoveredTick, setHoveredTick] = useState<number | null>(null)
  const router = useRouter()

  // Unified filter state for TalentFilterPanel
  const [advancedFilters, setAdvancedFilters] = useState<TalentFilters>(defaultFilters)

  // Sync advancedFilters to individual states for compatibility
  useEffect(() => {
    setGender(advancedFilters.gender || [])
    setBodyType(advancedFilters.bodyType || [])
    setEthnicity(advancedFilters.ethnicity?.join(', ') || '')
    setMinAge(advancedFilters.ageRange?.min !== 5 ? advancedFilters.ageRange?.min : '')
    setMaxAge(advancedFilters.ageRange?.max !== 80 ? advancedFilters.ageRange?.max : '')
    setMinHeight(advancedFilters.heightRange?.min !== 150 ? advancedFilters.heightRange?.min : '')
    setMaxHeight(advancedFilters.heightRange?.max !== 200 ? advancedFilters.heightRange?.max : '')
    setMinExp(advancedFilters.experience?.min !== 0 ? advancedFilters.experience?.min : '')
    setMaxExp(advancedFilters.experience?.max !== 20 ? advancedFilters.experience?.max : '')
    setEyeColor(advancedFilters.eyeColor?.join(', ') || '')
    setHairColor(advancedFilters.hairColor?.join(', ') || '')
    setSkills(advancedFilters.skills?.join(', ') || '')
    setLanguages(advancedFilters.languages?.join(', ') || '')
    setLocation(advancedFilters.location || '')
  }, [advancedFilters])

  // Toggle helpers to reduce nesting in JSX
  const toggleGender = useCallback((g: string) => {
    setGender((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }, [setGender])

  const removeGender = useCallback((g: string) => setGender((prev) => prev.filter((x) => x !== g)), [setGender])
  const removeBodyType = useCallback((bt: string) => setBodyType((prev) => prev.filter((x) => x !== bt)), [setBodyType])
  const clearEthnicity = useCallback(() => setEthnicity(''), [setEthnicity])
  const clearSkills = useCallback(() => setSkills(''), [setSkills])
  const clearLanguages = useCallback(() => setLanguages(''), [setLanguages])
  const clearEyeColor = useCallback(() => setEyeColor(''), [setEyeColor])
  const clearHairColor = useCallback(() => setHairColor(''), [setHairColor])

  const clearAllFilters = useCallback(() => {
    setGender([])
    setBodyType([])
    setEthnicity('')
    setMinAge('')
    setMaxAge('')
    setMinExp('')
    setMaxExp('')
    setMinHeight('')
    setMaxHeight('')
    setEyeColor('')
    setHairColor('')
    setSkills('')
    setLanguages('')
  }, [setGender, setBodyType, setEthnicity, setMinAge, setMaxAge, setMinExp, setMaxExp, setMinHeight, setMaxHeight, setEyeColor, setHairColor, setSkills, setLanguages])

  // Auto-select gender if gender-specific subcategory is chosen
  useEffect(() => {
    if (selectedSubcategory && subcategoryGenderMap[selectedSubcategory]) {
      setGender([subcategoryGenderMap[selectedSubcategory]]);
    }
  }, [selectedSubcategory, subcategoryGenderMap]);

  // Close dropdowns when clicking outside (only for category dropdown now)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsDropdownOpen])

  // Use real categories from API
  const [realCategories, setRealCategories] = useState<any[]>([])
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.success) {
          setRealCategories(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        // Fallback to static data if API fails
        setRealCategories(getCategoryData())
      }
    }
    fetchCategories()
  }, [])

  const selectedCatObj = useMemo(() => realCategories.find(cat => cat.id === selectedCategory), [realCategories, selectedCategory])

  const buildSearchParams = useCallback(() => {
    const params = new URLSearchParams()

    const setParamText = (key: string, val?: string) => {
      if (val?.trim()) params.set(key, val.trim())
    }
    const setParamCsv = (key: string, arr: string[]) => {
      if (arr.length) params.set(key, arr.join(','))
    }
    const setParamNum = (key: string, val: number | '') => {
      if (val !== '') params.set(key, String(val))
    }

    const applyCategoryFilter = (selected: string, sub: string) => {
      if (selected) {
        params.set('category', selected)
        if (sub) params.set('subcategory', sub)
        params.set('filter', 'talent')
      } else {
        params.set('filter', 'all')
      }
    }

    // Basic
    setParamText('q', searchTerm)
    applyCategoryFilter(selectedCategory, selectedSubcategory)
    setParamText('location', location)

    // Advanced
    setParamCsv('gender', gender)
    setParamCsv('bodyType', bodyType)
    setParamText('ethnicity', ethnicity)
    setParamNum('minAge', minAge)
    setParamNum('maxAge', maxAge)
    setParamNum('minExperience', minExp)
    setParamNum('maxExperience', maxExp)
    setParamNum('minHeight', minHeight)
    setParamNum('maxHeight', maxHeight)
    if (eyeColor.trim()) setParamText('eyeColor', eyeColor.split(',').map((s) => s.trim()).filter(Boolean).join(','))
    if (hairColor.trim()) setParamText('hairColor', hairColor.split(',').map((s) => s.trim()).filter(Boolean).join(','))
    if (skills.trim()) setParamText('skills', skills.split(',').map((s) => s.trim()).filter(Boolean).join(','))
    if (languages.trim()) setParamText('languages', languages.split(',').map((s) => s.trim()).filter(Boolean).join(','))

    return params
  }, [searchTerm, selectedCategory, selectedSubcategory, location, gender, bodyType, ethnicity, minAge, maxAge, minExp, maxExp, minHeight, maxHeight, eyeColor, hairColor, skills, languages])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const params = buildSearchParams()
    router.push(`/${locale}/search-results?${params.toString()}`)
  }, [buildSearchParams, router, locale])

  const hasAnyFilter = useMemo(() => Boolean(
    gender.length || bodyType.length || ethnicity || minAge !== '' || maxAge !== '' || minExp !== '' || maxExp !== '' || minHeight !== '' || maxHeight !== '' || eyeColor || hairColor || skills || languages
  ), [gender.length, bodyType.length, ethnicity, minAge, maxAge, minExp, maxExp, minHeight, maxHeight, eyeColor, hairColor, skills, languages])

  const chips = useMemo(() => {
    const list: { label: string; onRemove: () => void; k: string }[] = []
    if (selectedCategory) {
      const catName = realCategories.find(c => c.id === selectedCategory)?.name || selectedCategory
      list.push({ label: catName, onRemove: () => { setSelectedCategory(''); setSelectedSubcategory('') }, k: 'cat' })
    }
    if (selectedSubcategory && selectedCatObj) {
      const subName = selectedCatObj.subcategories?.find((s: any) => s.id === selectedSubcategory)?.name || selectedSubcategory
      list.push({ label: subName, onRemove: () => setSelectedSubcategory(''), k: 'sub' })
    }
    if (location) list.push({ label: location, onRemove: () => setLocation(''), k: 'loc' })
    gender.forEach(g => list.push({ label: g, onRemove: () => removeGender(g), k: `g-${g}` }))
    bodyType.forEach(b => list.push({ label: b, onRemove: () => removeBodyType(b), k: `bt-${b}` }))
    if (ethnicity) list.push({ label: ethnicity, onRemove: clearEthnicity, k: 'eth' })
    if (minAge !== '' || maxAge !== '') list.push({ label: `Age: ${minAge || 0}-${maxAge || 100}`, onRemove: () => { setMinAge(''); setMaxAge('') }, k: 'age' })
    if (minHeight !== '' || maxHeight !== '') list.push({ label: `Height: ${minHeight || 100}-${maxHeight || 220}`, onRemove: () => { setMinHeight(''); setMaxHeight('') }, k: 'height' })
    if (minExp !== '' || maxExp !== '') list.push({ label: `Exp: ${minExp || 0}-${maxExp || 50}+`, onRemove: () => { setMinExp(''); setMaxExp('') }, k: 'exp' })
    if (eyeColor) list.push({ label: `Eyes: ${eyeColor}`, onRemove: clearEyeColor, k: 'eyes' })
    if (hairColor) list.push({ label: `Hair: ${hairColor}`, onRemove: clearHairColor, k: 'hair' })
    if (skills) list.push({ label: `Skills: ${skills}`, onRemove: clearSkills, k: 'skills' })
    if (languages) list.push({ label: `Lang: ${languages}`, onRemove: clearLanguages, k: 'lang' })
    return list
  }, [selectedCategory, selectedSubcategory, location, gender, bodyType, ethnicity, minAge, maxAge, minHeight, maxHeight, minExp, maxExp, eyeColor, hairColor, skills, languages, realCategories, selectedCatObj, removeGender, removeBodyType, clearEthnicity, clearEyeColor, clearHairColor, clearSkills, clearLanguages])

  const tickFeatures = [
    {
      icon: <Users className="w-6 h-6" />,
      title: t('verifiedTalent') || 'Verified Talent',
      description: t('verifiedTalentDesc') || 'All profiles are manually verified'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: t('qualityAssured') || 'Quality Assured',
      description: t('qualityAssuredDesc') || 'Top-tier talent for your projects'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t('careerGrowth') || 'Career Growth',
      description: t('careerGrowthDesc') || 'Opportunities to advance your career'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
      <main>
      {/* Background Elements - Optimized for Performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating shapes - reduced opacity and blur for better performance, respect motion preferences */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-blue/15 to-accent-blue/25 rounded-full blur-lg motion-safe:animate-move-random-1"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-accent-red/15 to-primary-red/25 rounded-full blur-lg motion-safe:animate-move-random-2"></div>
        <div className="absolute bottom-32 left-1/4 w-64 h-64 bg-gradient-to-r from-primary-blue/8 to-accent-red/15 rounded-full blur-lg motion-safe:animate-move-random-3"></div>
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-gradient-to-r from-accent-blue/15 to-primary-blue/25 rounded-full blur-lg motion-safe:animate-move-random-4"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-3 dark:opacity-8"></div>
        
        {/* Subtle noise texture - dark mode only */}
        <div className="absolute inset-0 bg-noise-pattern opacity-0 dark:opacity-3"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/10 via-transparent to-primary-red/10 dark:from-primary-blue/20 dark:to-primary-red/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-56">

          <div className="text-center pt-16 pb-24">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              3<span className="text-primary-blue dark:text-accent-red">YES</span>ES
            </h1>

            {/* Welcome video hero */}
            <VideoHero url="/videos/Welcome.mp4" />
            
            {/* Animated Ticks Section - Now above the dynamic headline */}
            <div className="flex items-center justify-center space-x-6 mb-12">
              {tickFeatures.map((feature, index) => (
                <button
                  key={`tick-${feature.title.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  aria-label={`Learn more about ${feature.title}`}
                  className="relative group bg-transparent border-none p-0 cursor-pointer transition-transform duration-300 hover:scale-110"
                  onMouseEnter={() => setHoveredTick(index)}
                  onMouseLeave={() => setHoveredTick(null)}
                >
                  <SwoopingTick 
                    size={56}
                    hovered={hoveredTick === index}
                    className={`transition-all duration-300 ${
                      hoveredTick === index ? 'scale-125 rotate-12' : ''
                    }`}
                  />
                  {hoveredTick === index && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 shadow-xl z-[70] w-64 animate-fadeIn border border-primary-blue/20 dark:border-gray-600">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-primary-blue dark:text-accent-red">{feature.icon}</div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Dynamic Headline */}
            <DynamicHeadline />

            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              {t('tagline')}
            </p>

            {/* Advanced Search Form - streamlined */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-blue/30 dark:border-gray-600">
                {/* Main Search Bar */}
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-2 mb-4">
                  <div className="flex-1 flex items-center gap-2 px-4">
                    <Search className="text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 text-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-blue dark:bg-accent-red text-white px-6 py-3 rounded-md hover:bg-primary-blueHover dark:hover:bg-accent-red/80 transition-colors font-medium"
                  >
                    {t('searchButton')}
                  </button>
                </div>

                {/* Category, Location, Filters button */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-2">
                  {/* Category & Subcategory Dropdowns */}
                  <div className="relative dropdown-container flex flex-col gap-2">
                    {/* Main Category Dropdown */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-md border-0 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue focus:outline-none"
                      >
                        <span className={selectedCategory ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                          {selectedCategory
                            ? realCategories.find(cat => cat.id === selectedCategory)?.name || selectedCategory
                            : t('allCategories')}
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform text-gray-600 dark:text-gray-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 z-[60] max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary-blue/40 scrollbar-track-transparent">
                          <div className="p-2">
                            <button
                              type="button"
                              onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); setIsDropdownOpen(false) }}
                              className="w-full text-left px-4 py-2 hover:bg-primary-blue/10 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm font-medium"
                            >
                              {t('allCategories')}
                            </button>
                            {realCategories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(''); setIsDropdownOpen(false) }}
                                className="w-full text-left px-4 py-2 hover:bg-primary-blue/10 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-md text-sm"
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Subcategory Dropdown (shows only if category selected and has subcategories) */}
                    {selectedCatObj && selectedCatObj.subcategories && selectedCatObj.subcategories.length > 0 && (
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3 rounded-md border-0 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue focus:outline-none mt-1"
                          value={selectedSubcategory}
                          onChange={e => setSelectedSubcategory(e.target.value)}
                        >
                          <option value="">All {selectedCatObj.name}</option>
                          {selectedCatObj.subcategories.map((sub: any) => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {/* Location */}
                  <div className="relative flex items-center gap-2">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                    <input
                      type="text"
                      list="city-suggestions"
                      placeholder={t('location')}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 rounded-md border-0 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-blue focus:outline-none"
                      autoComplete="off"
                    />
                    <datalist id="city-suggestions">
                      <option value="London, UK" />
                      <option value="Paris, France" />
                      <option value="Berlin, Germany" />
                      <option value="New York, USA" />
                      <option value="Los Angeles, USA" />
                      <option value="Toronto, Canada" />
                      <option value="Sydney, Australia" />
                      <option value="Tokyo, Japan" />
                      <option value="Dubai, UAE" />
                      <option value="Cape Town, South Africa" />
                    </datalist>
                    <button
                      type="button"
                      aria-label="Use my location"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-blue/10 dark:bg-accent-red/10 rounded-full p-2 hover:bg-primary-blue/20 dark:hover:bg-accent-red/20 transition-colors"
                      onClick={async () => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(async (pos) => {
                            const { latitude, longitude } = pos.coords;
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                              const data = await res.json();
                              const city = data.address.city || data.address.town || data.address.village || '';
                              const country = data.address.country || '';
                              setLocation(city && country ? `${city}, ${country}` : country || city);
                            } catch {
                              setLocation('');
                            }
                          }, () => setLocation(''));
                        }
                      }}
                    >
                      <MapPin className="h-5 w-5 text-primary-blue dark:text-accent-red" />
                    </button>
                  </div>
                  {/* Filters button */}
                  <div className="flex md:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsFiltersOpen((v) => !v)}
                      className="w-full md:w-auto px-4 py-3 rounded-md border border-primary-blue dark:border-accent-red bg-white/90 dark:bg-gray-800/90 text-primary-blue dark:text-accent-red hover:bg-primary-blue/10 dark:hover:bg-accent-red/10 flex items-center justify-center gap-2 font-semibold shadow"
                      aria-expanded={isFiltersOpen}
                    >
                      <span>{t('filters')}</span>
                      {chips.length > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center min-w-6 h-6 text-xs rounded-full bg-primary-blue text-white px-2">{chips.length}</span>
                      )}
                    </button>
                  </div>
                </div>
                {/* Expanded advanced filters section */}
                {isFiltersOpen && (
                  <div className="w-full mt-4">
                    <TalentFilterPanel
                      filters={advancedFilters}
                      onFiltersChange={setAdvancedFilters}
                      onClose={() => setIsFiltersOpen(false)}
                      onApply={() => setIsFiltersOpen(false)}
                      showHeader={true}
                    />
                  </div>
                )}

                {/* Active Filters Indicator */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {chips.map((chip) => (
                    <span
                      key={chip.k}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300"
                    >
                      {chip.label}
                      <button type="button" onClick={chip.onRemove} className="ml-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">×</button>
                    </span>
                  ))}
                  {hasAnyFilter && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs underline text-primary-blue dark:text-accent-red"
                    >
                      {t('clearAll')}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Welcome Video Section - Backstage Inspired */}
      <div className="relative py-24 bg-gradient-to-r from-primary-blue/8 to-primary-red/8 dark:from-primary-blue/20 dark:to-primary-red/20 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center pt-12" >
            <div className="text-gray-900 dark:text-white flex flex-col justify-start h-full min-h-[320px] pl-2 md:pl-6 lg:pl-8 mt-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 pl-2 md:pl-4 lg:pl-8">
                {t('findYourNextJob')}{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red">
                  {t('elevateYourCareer')}
                </span>
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                {t('joinThousands')}{' '}
                {t('supportCreativeJourney')}
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red hover:from-primary-blueHover hover:to-primary-blue dark:hover:from-primary-red dark:hover:to-accent-red text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                  {t('joinNow')}
                </button>
                <button className="border-2 border-primary-blue/50 dark:border-accent-red/50 hover:border-primary-blue dark:hover:border-accent-red text-gray-800 dark:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:bg-primary-blue/10 dark:hover:bg-accent-red/10">
                  {t('learnMore')}
                </button>
              </div>
            </div>
            
            <HeroSlideshow />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-primary-blue/5 to-primary-red/5 dark:from-primary-blue/10 dark:to-primary-red/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-blue dark:group-hover:text-accent-red transition-colors">10K+</div>
              <div className="text-gray-600 dark:text-gray-300">{t('activeTalent')}</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-accent-blue dark:group-hover:text-primary-red transition-colors">500+</div>
              <div className="text-gray-600 dark:text-gray-300">{t('projectsPosted')}</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-blue dark:group-hover:text-accent-red transition-colors">95%</div>
              <div className="text-gray-600 dark:text-gray-300">{t('successRate')}</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-accent-blue dark:group-hover:text-primary-red transition-colors">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">{t('support')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-gradient-to-br from-primary-blue/8 via-transparent to-primary-red/8 dark:from-primary-blue/20 dark:via-transparent dark:to-primary-red/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">{t('howItWorksTitle')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('howItWorksDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <UserPlus className="h-12 w-12" />,
                title: t('createYourProfile'),
                description: t('createYourProfileDescription')
              },
              {
                step: "02",
                icon: <LucideImage className="h-12 w-12" />,
                title: t('showcaseYourWork'),
                description: t('showcaseYourWorkDescription')
              },
              {
                step: "03",
                icon: <BarChart3 className="h-12 w-12" />,
                title: t('buildYourReputation'),
                description: t('buildYourReputationDescription')
              }
            ].map((item) => (
              <div key={`step-${item.step}-${item.title.replace(/\s+/g, '-').toLowerCase()}`} className="text-center group">
                <div className="bg-gradient-to-br from-primary-blue/20 to-primary-red/20 rounded-2xl p-8 backdrop-blur-sm border border-primary-blue/20 hover:border-accent-red/50 dark:hover:border-primary-blue/50 transition-all duration-300 group-hover:scale-105">
                  <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red mb-4 group-hover:from-accent-blue group-hover:to-primary-blue dark:group-hover:from-primary-red dark:group-hover:to-accent-red transition-all duration-300">
                    {item.step}
                  </div>
                  <div className="flex justify-center mb-4 text-primary-blue dark:text-accent-red group-hover:text-accent-blue dark:group-hover:text-primary-red transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <FeatureHighlights />
    </main>
  </div>
  )
}
