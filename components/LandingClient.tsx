'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getCategoryData } from '@/lib/data'
import { Search, MapPin, ChevronDown, Play, Users, Star, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

import SwoopingTick from './SwoopingTick'
import DynamicHeadline from './DynamicHeadline'
import RangeSlider from './RangeSlider'
import MultiSelect from './MultiSelect'

export default function LandingClient() {
  // State declarations
  // ...existing code...

  // Map subcategory to gender (memoized)
  const subcategoryGenderMap = useMemo(() => ({
    'female-actor': 'female',
    'male-actor': 'male',
    'non-binary-actor': 'non-binary',
    'child-actor': '', // No gender auto-select for child
  } as Record<string, string>), []);

  // ...existing code...
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
  const [skills, setSkills] = useState<string>('')
  const [languages, setLanguages] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  // Removed isProfileOpen and isNotificationOpen, now handled globally
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [hoveredTick, setHoveredTick] = useState<number | null>(null)
  const router = useRouter()

  // Toggle helpers to reduce nesting in JSX
  const toggleGender = useCallback((g: string) => {
    setGender((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }, [setGender])


  const removeGender = useCallback((g: string) => setGender((prev) => prev.filter((x) => x !== g)), [setGender])
  const removeBodyType = useCallback((bt: string) => setBodyType((prev) => prev.filter((x) => x !== bt)), [setBodyType])
  const clearEthnicity = useCallback(() => setEthnicity(''), [setEthnicity])
  const clearSkills = useCallback(() => setSkills(''), [setSkills])
  const clearLanguages = useCallback(() => setLanguages(''), [setLanguages])

  const clearAllFilters = useCallback(() => {
    setGender([])
    setBodyType([])
    setEthnicity('')
    setMinAge('')
    setMaxAge('')
    setMinExp('')
    setMaxExp('')
    setSkills('')
    setLanguages('')
  }, [setGender, setBodyType, setEthnicity, setMinAge, setMaxAge, setMinExp, setMaxExp, setSkills, setLanguages])

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

  // Use real categories from data
  const realCategories = useMemo(() => getCategoryData(), [])

  const selectedCatObj = useMemo(() => realCategories.find(cat => cat.id === selectedCategory), [realCategories, selectedCategory])

  // Helper functions for display names
  // const getFilterType = (category: string): string => {
  //   if (category === 'professionals') return 'talent'
  //   if (category === 'specializations') return 'categories'
  //   if (category === 'skills') return 'features'
  //   return 'talent'
  // }

  // Removed quick tabs; keeping only category dropdown and filters toggle.


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
    if (skills.trim()) setParamText('skills', skills.split(',').map((s) => s.trim()).filter(Boolean).join(','))
    if (languages.trim()) setParamText('languages', languages.split(',').map((s) => s.trim()).filter(Boolean).join(','))

    return params
  }, [searchTerm, selectedCategory, selectedSubcategory, location, gender, bodyType, ethnicity, minAge, maxAge, minExp, maxExp, skills, languages])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const params = buildSearchParams()
    router.push(`/search?${params.toString()}`)
  }, [buildSearchParams, router])

  const hasAnyFilter = useMemo(() => Boolean(
    gender.length || bodyType.length || ethnicity || minAge !== '' || maxAge !== '' || minExp !== '' || maxExp !== '' || skills || languages
  ), [gender.length, bodyType.length, ethnicity, minAge, maxAge, minExp, maxExp, skills, languages])

  const chips = useMemo(() => {
    const arr: { k: string; label: string; onRemove: () => void }[] = []
    gender.forEach((g) => arr.push({ k: `gender:${g}`, label: `Gender: ${g}`, onRemove: removeGender.bind(null, g) }))
    bodyType.forEach((bt) => arr.push({ k: `body:${bt}`, label: `Body: ${bt}`, onRemove: removeBodyType.bind(null, bt) }))
    if (ethnicity) ethnicity.split(',').forEach((e) => arr.push({ k: `eth:${e.trim()}`, label: `Ethnicity: ${e.trim()}`, onRemove: clearEthnicity }))
    if (minAge !== '') arr.push({ k: 'minAge', label: `MinAge: ${minAge}`, onRemove: () => setMinAge('') })
    if (maxAge !== '') arr.push({ k: 'maxAge', label: `MaxAge: ${maxAge}`, onRemove: () => setMaxAge('') })
    if (minExp !== '') arr.push({ k: 'minExp', label: `MinExp: ${minExp}`, onRemove: () => setMinExp('') })
    if (maxExp !== '') arr.push({ k: 'maxExp', label: `MaxExp: ${maxExp}`, onRemove: () => setMaxExp('') })
    if (skills) skills.split(',').forEach((s) => arr.push({ k: `skill:${s.trim()}`, label: `Skill: ${s.trim()}`, onRemove: clearSkills }))
    if (languages) languages.split(',').forEach((l) => arr.push({ k: `lang:${l.trim()}`, label: `Lang: ${l.trim()}`, onRemove: clearLanguages }))
    return arr
  }, [gender, bodyType, ethnicity, minAge, maxAge, minExp, maxExp, skills, languages, removeGender, removeBodyType, clearEthnicity, clearSkills, clearLanguages, setMinAge, setMaxAge, setMinExp, setMaxExp])

  const tickFeatures = useMemo(() => [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Talent",
      description: "Connect with verified professionals across all creative industries"
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Quality Assured",
      description: "All talent profiles are verified and reviewed for authenticity"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Career Growth",
      description: "Tools and resources to help talent advance their careers"
    }
  ], [])


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
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
              Connect with top talent and industry professionals. Find your perfect match for any creative project.
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
                      placeholder="Search for professionals, specializations, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 text-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-blue dark:bg-accent-red text-white px-6 py-3 rounded-md hover:bg-primary-blueHover dark:hover:bg-accent-red/80 transition-colors font-medium"
                  >
                    Search
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
                            : 'All Categories'}
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
                              All Categories
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
                          {selectedCatObj.subcategories.map(sub => (
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
                      placeholder="City, State, Country"
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
                      <span>Filters</span>
                      {chips.length > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center min-w-6 h-6 text-xs rounded-full bg-primary-blue text-white px-2">{chips.length}</span>
                      )}
                    </button>
                  </div>
                </div>
                {/* Expanded advanced filters section (fix: ensure this renders after the search controls grid) */}
                {isFiltersOpen && (
                  <div className="w-full mt-4 bg-white dark:bg-gray-900 border border-primary-blue dark:border-accent-red rounded-xl shadow-xl p-6 transition-all duration-300 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Gender */}
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Gender</div>
                        <div className="flex flex-wrap gap-2">
                          {['male','female','non-binary','other'].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => toggleGender(g)}
                              className={`px-4 py-2 rounded-md border text-sm transition-all duration-150 ${gender.includes(g)
                                ? 'bg-primary-blue text-white border-primary-blue ring-2 ring-primary-blue'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
                              aria-pressed={gender.includes(g)}
                            >
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Ethnicity */}
                      <div>
                        <MultiSelect
                          options={ethnicityOptions}
                          value={Array.isArray(ethnicity) ? ethnicity : (ethnicity ? ethnicity.split(',').map(s => s.trim()).filter(Boolean) : [])}
                          onChange={vals => setEthnicity(vals.join(', '))}
                          placeholder="Select or type ethnicity"
                          allowCustom
                          label="Ethnicity"
                        />
                      </div>
                      {/* Age */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Age</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RangeSlider
                            min={0}
                            max={100}
                            values={[minAge === '' ? 0 : minAge, maxAge === '' ? 100 : maxAge]}
                            onChange={([min, max]) => { setMinAge(min); setMaxAge(max); }}
                          />
                          <span className="text-xs">or</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={minAge === maxAge && minAge !== '' ? minAge : ''}
                            onChange={e => {
                              const val = e.target.value ? Number(e.target.value) : '';
                              setMinAge(val); setMaxAge(val);
                            }}
                            placeholder="Specific Age"
                            className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-700"
                          />
                        </div>
                      </div>
                      {/* Experience */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Experience (years)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RangeSlider
                            min={0}
                            max={50}
                            values={[minExp === '' ? 0 : minExp, maxExp === '' ? 50 : maxExp]}
                            onChange={([min, max]) => { setMinExp(min); setMaxExp(max); }}
                          />
                          <span className="text-xs">or</span>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={minExp === maxExp && minExp !== '' ? minExp : ''}
                            onChange={e => {
                              const val = e.target.value ? Number(e.target.value) : '';
                              setMinExp(val); setMaxExp(val);
                            }}
                            placeholder="Specific Years"
                            className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-700"
                          />
                        </div>
                      </div>
                      {/* Skills */}
                      <div>
                        <MultiSelect
                          options={skillsOptions}
                          value={Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [])}
                          onChange={vals => setSkills(vals.join(', '))}
                          placeholder="Select or type skills"
                          allowCustom
                          label="Skills"
                        />
                      </div>
                      {/* Languages */}
                      <div>
                        <MultiSelect
                          options={languageOptions}
                          value={Array.isArray(languages) ? languages : (languages ? languages.split(',').map(s => s.trim()).filter(Boolean) : [])}
                          onChange={vals => setLanguages(vals.join(', '))}
                          placeholder="Select or type languages"
                          allowCustom
                          label="Languages"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-8 gap-2">
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFiltersOpen(false)}
                        className="flex-1 px-4 py-2 rounded-md bg-primary-blue text-white text-sm font-semibold shadow hover:bg-primary-blueHover transition-all"
                      >
                        Apply Filters
                      </button>
                    </div>
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
                      Clear all
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-gray-900 dark:text-white">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Find your next job and{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red">
                  elevate your career
                </span>
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                Join thousands of talented professionals who trust 3YESES to connect them with their dream projects. 
                From auditions to bookings, we&apos;re here to support your creative journey.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red hover:from-primary-blueHover hover:to-primary-blue dark:hover:from-primary-red dark:hover:to-accent-red text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                  Join Now
                </button>
                <button className="border-2 border-primary-blue/50 dark:border-accent-red/50 hover:border-primary-blue dark:hover:border-accent-red text-gray-800 dark:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:bg-primary-blue/10 dark:hover:bg-accent-red/10">
                  Learn More
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative group cursor-pointer">
                <div className="bg-gradient-to-br from-primary-blue/20 to-primary-red/20 rounded-2xl p-8 backdrop-blur-sm border border-primary-blue/20">
                  <div className="aspect-video bg-black/50 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/30 to-primary-red/30"></div>
                    <button className="relative z-10 bg-primary-blue/80 dark:bg-accent-red/80 hover:bg-primary-blue dark:hover:bg-accent-red backdrop-blur-sm rounded-full p-6 transition-all duration-300 transform hover:scale-110 group-hover:scale-125">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </button>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Watch How It Works</h3>
                    <p className="text-gray-700 dark:text-gray-300">See how 3YESES connects talent with opportunities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-primary-blue/5 to-primary-red/5 dark:from-primary-blue/10 dark:to-primary-red/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-blue dark:group-hover:text-accent-red transition-colors">10K+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Talent</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-accent-blue dark:group-hover:text-primary-red transition-colors">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Projects Posted</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-blue dark:group-hover:text-accent-red transition-colors">95%</div>
              <div className="text-gray-600 dark:text-gray-300">Success Rate</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-accent-blue dark:group-hover:text-primary-red transition-colors">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-gradient-to-br from-primary-blue/8 via-transparent to-primary-red/8 dark:from-primary-blue/20 dark:via-transparent dark:to-primary-red/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">How 3YESES Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform makes it easy to connect, collaborate, and create amazing projects together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Showcase your talents, experience, and portfolio to stand out from the crowd."
              },
              {
                step: "02", 
                title: "Browse & Apply",
                description: "Find projects that match your skills and interests. Apply with confidence."
              },
              {
                step: "03",
                title: "Get Hired",
                description: "Connect with clients, negotiate terms, and bring creative visions to life."
              }
            ].map((item) => (
              <div key={`step-${item.step}-${item.title.replace(/\s+/g, '-').toLowerCase()}`} className="text-center group">
                <div className="bg-gradient-to-br from-primary-blue/20 to-primary-red/20 rounded-2xl p-8 backdrop-blur-sm border border-primary-blue/20 hover:border-accent-red/50 dark:hover:border-primary-blue/50 transition-all duration-300 group-hover:scale-105">
                  <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red mb-4 group-hover:from-accent-blue group-hover:to-primary-blue dark:group-hover:from-primary-red dark:group-hover:to-accent-red transition-all duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
