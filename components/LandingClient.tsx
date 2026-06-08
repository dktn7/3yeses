'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { getCategoryData } from '@/lib/data.ts'
import { Search, MapPin, ChevronDown, Check, Users, Star, TrendingUp, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import SwoopingTick from './SwoopingTick.tsx'
import DynamicHeadline from './DynamicHeadline.tsx'
import VideoPlayer from './VideoPlayer'
import RangeSlider from './RangeSlider.tsx'
import MultiSelect from './MultiSelect.tsx'
import HeroSlideshow from './HeroSlideshow.tsx'
import TalentFilterPanel, { TalentFilters, defaultFilters } from './TalentFilterPanel'
import CategoryReel from './CategoryReel'
import DropdownPanel from './DropdownPanel'
import { useTranslations } from 'next-intl'
import { getCategoryTranslationKey } from '@/lib/categoryTranslations'
import { buildLocalizedPath } from '@/lib/locale-path'

const CITY_SUGGESTIONS = [
  'London, UK', 'Paris, France', 'Berlin, Germany', 'New York, USA',
  'Los Angeles, USA', 'Toronto, Canada', 'Sydney, Australia', 'Tokyo, Japan',
  'Dubai, UAE', 'Cape Town, South Africa', 'Madrid, Spain', 'Rome, Italy',
  'Amsterdam, Netherlands', 'Barcelona, Spain', 'Vancouver, Canada',
  'Mexico City, Mexico', 'Buenos Aires, Argentina', 'Melbourne, Australia',
  'Seoul, South Korea', 'Bangkok, Thailand', 'Singapore, Singapore', 'Mumbai, India',
  'Delhi, India', 'Shanghai, China', 'Istanbul, Turkey', 'São Paulo, Brazil',
]

function HomeBgDecoration() {
  return (
    <div className="marketing-wave-tone-showcase absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="homeAbBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-veil, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-strong)" />
            <stop offset="55%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-soft)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="homeAbW1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-strong)" />
            <stop offset="100%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-soft)" />
          </linearGradient>
          <linearGradient id="homeAbW2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-strong)" />
            <stop offset="100%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-soft)" />
          </linearGradient>
          <radialGradient id="homeAbGlow" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity="var(--marketing-wave-bg-strong)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#homeAbBg)" />
        <rect width="1440" height="900" fill="url(#homeAbGlow)" />
        <path d="M0 520 C240 420 480 580 720 500 C960 420 1200 540 1440 480 L1440 900 L0 900 Z" fill="url(#homeAbW1)" opacity="var(--marketing-wave-main-strong)" />
        <path d="M0 640 C320 570 560 690 800 620 C1040 550 1280 660 1440 600 L1440 900 L0 900 Z" fill="url(#homeAbW2)" opacity="var(--marketing-wave-secondary-strong)" />
        <path d="M0 80 C360 140 720 40 1080 100 C1260 130 1380 90 1440 110 L1440 0 L0 0 Z" fill="var(--wave-primary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-top-opacity)" />
        <circle cx="200" cy="150" r="200" fill="var(--wave-orb, var(--marketing-wave-accent))" opacity="var(--marketing-wave-orb-opacity)" />
        <circle cx="1250" cy="700" r="260" fill="var(--wave-secondary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-orb-soft-opacity)" />
        <circle cx="720" cy="400" r="280" fill="var(--brand-glow)" opacity="var(--marketing-wave-orb-soft-opacity)" />
      </svg>
    </div>
  )
}

export default function LandingClient({ t = (k: any) => k, locale = 'en-gb' }: { t?: any; locale?: string }) {
  // State declarations
  const tCategories = useTranslations('Categories')

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
  const [disabilities, setDisabilities] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false)
  const [showLocSuggestions, setShowLocSuggestions] = useState(false)
  const categoryAnchorRef = useRef<HTMLButtonElement | null>(null)
  const subcategoryAnchorRef = useRef<HTMLButtonElement | null>(null)
  const locationAnchorRef = useRef<HTMLInputElement | null>(null)
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
    setDisabilities(advancedFilters.disabilities || [])
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
  const removeDisability = useCallback((value: string) => setDisabilities((prev) => prev.filter((item) => item !== value)), [setDisabilities])

  const getTranslatedCategoryName = useCallback((category?: { id?: string; slug?: string; name?: string } | null) => {
    if (!category?.name) return ''
    const translationKey = getCategoryTranslationKey(category.id, category.slug, category.name)
    if (!translationKey) return category.name
    const messageKey = `names.${translationKey}`
    return typeof tCategories.has === 'function' && tCategories.has(messageKey) ? tCategories(messageKey) : category.name
  }, [tCategories])

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
    setDisabilities([])
  }, [setGender, setBodyType, setEthnicity, setMinAge, setMaxAge, setMinExp, setMaxExp, setMinHeight, setMaxHeight, setEyeColor, setHairColor, setSkills, setLanguages, setDisabilities])

  // Auto-select gender if gender-specific subcategory is chosen
  useEffect(() => {
    if (selectedSubcategory && subcategoryGenderMap[selectedSubcategory]) {
      setGender([subcategoryGenderMap[selectedSubcategory]]);
    }
  }, [selectedSubcategory, subcategoryGenderMap]);

  // Close dropdowns when clicking outside (category/subcategory/location)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container') && !target.closest('.dropdown-panel')) {
        setIsDropdownOpen(false)
      }
      if (!target.closest('.subcategory-container') && !target.closest('.dropdown-panel')) {
        setIsSubcategoryOpen(false)
      }
      if (!target.closest('.location-container') && !target.closest('.dropdown-panel')) {
        setShowLocSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsDropdownOpen, setIsSubcategoryOpen])

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
    setParamCsv('disabilities', disabilities)

    return params
  }, [searchTerm, selectedCategory, selectedSubcategory, location, gender, bodyType, ethnicity, minAge, maxAge, minExp, maxExp, minHeight, maxHeight, eyeColor, hairColor, skills, languages, disabilities])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const params = buildSearchParams()
    router.push(buildLocalizedPath(locale, `/search-results?${params.toString()}`))
  }, [buildSearchParams, router, locale])

  const hasAnyFilter = useMemo(() => Boolean(
    gender.length || bodyType.length || ethnicity || minAge !== '' || maxAge !== '' || minExp !== '' || maxExp !== '' || minHeight !== '' || maxHeight !== '' || eyeColor || hairColor || skills || languages || disabilities.length
  ), [gender.length, bodyType.length, ethnicity, minAge, maxAge, minExp, maxExp, minHeight, maxHeight, eyeColor, hairColor, skills, languages, disabilities.length])

  const chips = useMemo(() => {
    const list: { label: string; onRemove: () => void; k: string }[] = []
    if (selectedCategory) {
      const catName = getTranslatedCategoryName(realCategories.find(c => c.id === selectedCategory)) || selectedCategory
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
    if (minAge !== '' || maxAge !== '') list.push({ label: t('chipAge', { min: minAge || 0, max: maxAge || 100 }), onRemove: () => { setMinAge(''); setMaxAge('') }, k: 'age' })
    if (minHeight !== '' || maxHeight !== '') list.push({ label: t('chipHeight', { min: minHeight || 100, max: maxHeight || 220 }), onRemove: () => { setMinHeight(''); setMaxHeight('') }, k: 'height' })
    if (minExp !== '' || maxExp !== '') list.push({ label: t('chipExp', { min: minExp || 0, max: maxExp || 50 }), onRemove: () => { setMinExp(''); setMaxExp('') }, k: 'exp' })
    if (eyeColor) list.push({ label: t('chipEyes', { value: eyeColor }), onRemove: clearEyeColor, k: 'eyes' })
    if (hairColor) list.push({ label: t('chipHair', { value: hairColor }), onRemove: clearHairColor, k: 'hair' })
    if (skills) list.push({ label: t('chipSkills', { value: skills }), onRemove: clearSkills, k: 'skills' })
    if (languages) list.push({ label: t('chipLang', { value: languages }), onRemove: clearLanguages, k: 'lang' })
    disabilities.forEach((value) => list.push({ label: t('chipAccessibility', { value }), onRemove: () => removeDisability(value), k: `dis-${value}` }))
    return list
  }, [selectedCategory, selectedSubcategory, location, gender, bodyType, ethnicity, minAge, maxAge, minHeight, maxHeight, minExp, maxExp, eyeColor, hairColor, skills, languages, disabilities, realCategories, selectedCatObj, removeGender, removeBodyType, clearEthnicity, clearEyeColor, clearHairColor, clearSkills, clearLanguages, removeDisability, getTranslatedCategoryName, t])

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
    <div className="min-h-screen landing-bg brand-true-red relative isolate overflow-hidden transition-colors duration-300">
      <main>
      {/* Background Elements */}
      <HomeBgDecoration />

      {/* ─── Hero Section — full-bleed visual (no background video) ─── */}
      <section className="relative min-h-[100dvh] flex items-center justify-center isolate">

        {/* Content layer */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="text-center mb-16">
            {/* Eyebrow tag */}
            <span className="marketing-pill inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] font-semibold marketing-accent-text mb-10 shadow-sm backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <SwoopingTick className="w-[1.125rem] h-[1.125rem] shrink-0" />
              {t('forTalent.title')}
            </span>

              <h1 className="marketing-hero-title mb-8 text-6xl font-bold leading-[1.02] tracking-tighter dark:[text-shadow:0_6px_22px_rgba(0,0,0,0.36)] md:text-8xl lg:text-9xl">
                3<span className="marketing-yes-accent">YES</span>ES
            </h1>

            {/* Dynamic Headline */}
            <DynamicHeadline />

            <p className="marketing-hero-muted mx-auto mb-14 max-w-2xl text-lg leading-relaxed dark:[text-shadow:0_2px_14px_rgba(0,0,0,0.18)] md:text-xl">
              {t('tagline')}
            </p>

            {/* Animated tick features */}
            <div className="flex items-center justify-center gap-6 md:gap-10 mb-16">
              {tickFeatures.map((feature, index) => (
                <button
                  key={`tick-${feature.title.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  aria-label={`Learn more about ${feature.title}`}
                  className="relative group bg-transparent border-none p-0 cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 active:scale-[0.97]"
                  onMouseEnter={() => setHoveredTick(index)}
                  onMouseLeave={() => setHoveredTick(null)}
                >
                  <SwoopingTick
                    size={52}
                    hovered={hoveredTick === index}
                    className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${hoveredTick === index ? 'scale-125 rotate-12' : ''}`}
                  />
                  {hoveredTick === index && (
                    <div className="marketing-surface absolute bottom-20 left-1/2 -translate-x-1/2 rounded-2xl p-5 z-[70] w-64 animate-fadeIn ring-1 ring-black/5 shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.60)]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="marketing-accent-text">{feature.icon}</div>
                        <h4 className="font-semibold text-gray-900 dark:text-slate-50 text-sm tracking-tight">{feature.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Double-Bezel search container (outer shell → inner core) ─── */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            {/* Outer shell */}
            <div className="marketing-surface rounded-[2.5rem] p-2 ring-1 ring-[var(--marketing-surface-strong)] shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_24px_64px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_24px_64px_rgba(0,0,0,0.45)] md:p-2.5">
              {/* Inner core */}
              <div className="rounded-[calc(2.5rem-0.5rem)] bg-[var(--chrome-panel)] p-6 shadow-[inset_0_1px_1px_rgba(148,163,184,0.16)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] sm:p-8">
                {/* Main search bar */}
                <div className="flex items-center gap-2 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-panel)] p-1.5 mb-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:border-[var(--brand-primary)]/35 focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/15 dark:focus-within:ring-[var(--brand-primary)]/20">
                  <div className="flex-1 flex items-center gap-3 pl-4">
                    <Search className="text-gray-500 dark:text-gray-400 h-5 w-5 shrink-0" />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
                    />
                  </div>
                  {/* Button-in-button CTA */}
                  <button
                    type="submit"
                    className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)] py-2 pl-5 pr-1.5 text-sm font-semibold text-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl active:scale-[0.97]"
                  >
                    <span>{t('searchButton')}</span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                      <Search className="w-4 h-4" />
                    </span>
                  </button>
                </div>

                {/* Category, Location, Filters row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center mb-3">
                  {/* Category dropdown */}
                  <div className="relative dropdown-container flex flex-col gap-2">
                    <button
                      ref={categoryAnchorRef}
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white text-sm shadow-[0_6px_18px_rgba(15,23,42,0.04)] focus:ring-2 focus:ring-[var(--brand-glow)] focus:border-[var(--brand-primary)] focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="listbox"
                    >
                      <span className={selectedCategory ? 'text-gray-900 dark:text-[var(--marketing-accent)] font-medium' : 'text-gray-500 dark:text-gray-300'}>
                        {selectedCategory
                          ? getTranslatedCategoryName(realCategories.find(cat => cat.id === selectedCategory)) || selectedCategory
                          : t('allCategories')}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-300 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                      <DropdownPanel portal anchorRef={categoryAnchorRef} matchWidth className="p-2">
                        <div className="p-0">
                          <button
                            type="button"
                            onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); setIsDropdownOpen(false) }}
                            className={`w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-xl text-sm transition-colors duration-200 ${selectedCategory === '' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-[var(--marketing-accent)] font-semibold' : 'text-gray-700 dark:text-gray-100 hover-smart-bg'}`}
                          >
                            <span>{t('allCategories')}</span>
                            {selectedCategory === '' && <Check className="h-4 w-4" />}
                          </button>
                          {realCategories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(''); setIsDropdownOpen(false) }}
                              className={`w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-xl text-sm transition-colors duration-200 ${selectedCategory === cat.id ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-[var(--marketing-accent)] font-semibold' : 'text-gray-700 dark:text-gray-100 hover-smart-bg'}`}
                            >
                              <span>{getTranslatedCategoryName(cat) || cat.name}</span>
                              {selectedCategory === cat.id && <Check className="h-4 w-4" />}
                            </button>
                          ))}
                        </div>
                      </DropdownPanel>
                    )}
                    {selectedCatObj && selectedCatObj.subcategories && selectedCatObj.subcategories.length > 0 && (
                      <div className="relative subcategory-container">
                        <button
                          ref={subcategoryAnchorRef}
                          type="button"
                          onClick={() => setIsSubcategoryOpen((current) => !current)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white text-sm shadow-[0_6px_18px_rgba(15,23,42,0.04)] focus:ring-2 focus:ring-[var(--brand-glow)] focus:border-[var(--brand-primary)] focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] mt-1"
                          aria-expanded={isSubcategoryOpen}
                          aria-haspopup="listbox"
                        >
                          <span className={selectedSubcategory ? 'text-gray-900 dark:text-[var(--marketing-accent)] font-medium' : 'text-gray-500 dark:text-gray-300'}>
                            {selectedSubcategory
                              ? selectedCatObj.subcategories.find((sub: any) => sub.id === selectedSubcategory)?.name || selectedSubcategory
                              : t('allCategory', { name: getTranslatedCategoryName(selectedCatObj) || selectedCatObj.name })}
                          </span>
                          <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-300 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSubcategoryOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSubcategoryOpen && (
                          <DropdownPanel portal anchorRef={subcategoryAnchorRef} matchWidth className="p-2">
                            <div className="p-0">
                              <button
                                type="button"
                                className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm transition-colors ${selectedSubcategory === '' ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-[var(--marketing-accent)] font-semibold' : 'text-gray-700 dark:text-gray-100 hover-smart-bg'}`}
                                onClick={() => { setSelectedSubcategory(''); setIsSubcategoryOpen(false) }}
                              >
                                <span>{t('allCategory', { name: getTranslatedCategoryName(selectedCatObj) || selectedCatObj.name })}</span>
                              </button>
                              {selectedCatObj.subcategories.map((sub: any) => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm transition-colors ${selectedSubcategory === sub.id ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-[var(--marketing-accent)] font-semibold' : 'text-gray-700 dark:text-gray-100 hover-smart-bg'}`}
                                  onClick={() => { setSelectedSubcategory(sub.id); setIsSubcategoryOpen(false) }}
                                >
                                  <span>{sub.name}</span>
                                  {selectedSubcategory === sub.id && <Check className="h-4 w-4" />}
                                </button>
                              ))}
                            </div>
                          </DropdownPanel>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="relative location-container">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 pointer-events-none z-10" />
                    <input
                      ref={locationAnchorRef}
                      type="text"
                      placeholder={t('location')}
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setShowLocSuggestions(true); }}
                      onFocus={() => setShowLocSuggestions(true)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 text-sm shadow-[0_6px_18px_rgba(15,23,42,0.04)] focus:ring-2 focus:ring-[var(--brand-glow)] focus:border-[var(--brand-primary)] focus:outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                      autoComplete="off"
                    />
                    {showLocSuggestions && (() => {
                      const sug = CITY_SUGGESTIONS.filter(c =>
                        !location || c.toLowerCase().includes(location.toLowerCase())
                      ).slice(0, 9);
                      return sug.length > 0 ? (
                        <DropdownPanel portal anchorRef={locationAnchorRef} matchWidth className="p-2">
                          <div className="p-0">
                            {sug.map((city) => (
                              <button
                                key={city}
                                type="button"
                                onMouseDown={() => { setLocation(city); setShowLocSuggestions(false); }}
                                className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm transition-colors duration-200 text-gray-700 dark:text-gray-100 hover-smart-bg"
                              >
                                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                {city}
                              </button>
                            ))}
                          </div>
                        </DropdownPanel>
                      ) : null;
                    })()}
                    <button
                      type="button"
                      aria-label="Use my location"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center hover:bg-[var(--brand-primary)]/20 transition-colors duration-300"
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
                      <MapPin className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    </button>
                  </div>

                  {/* Filters toggle */}
                  <div className="flex md:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsFiltersOpen((v) => !v)}
                      className="group flex w-full items-center justify-center gap-2 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-panel)] px-5 py-2.5 text-sm font-semibold text-[var(--marketing-accent)] shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/[0.06] active:scale-[0.97] md:w-auto"
                      aria-expanded={isFiltersOpen}
                    >
                      <span>{t('filters')}</span>
                      {chips.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-5 h-5 text-[10px] rounded-full bg-[var(--brand-primary)] text-white px-1.5">{chips.length}</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded filter panel */}
                {isFiltersOpen && (
                  <div className="w-full mt-4 rounded-[1.25rem] overflow-hidden ring-1 ring-[var(--marketing-border)] bg-[var(--marketing-panel-soft)]">
                    <TalentFilterPanel
                      filters={advancedFilters}
                      onFiltersChange={setAdvancedFilters}
                      onClose={() => setIsFiltersOpen(false)}
                      onApply={() => setIsFiltersOpen(false)}
                      showHeader={true}
                    />
                  </div>
                )}

                {/* Active filter chips */}
                {(chips.length > 0 || hasAnyFilter) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {chips.map((chip) => (
                      <span
                        key={chip.k}
                        className="marketing-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full ring-1 ring-[var(--marketing-pill-border)] text-xs text-gray-700 dark:text-slate-50"
                      >
                        {chip.label}
                        <button type="button" onClick={chip.onRemove} className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-100 transition-colors">×</button>
                      </span>
                    ))}
                    {hasAnyFilter && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-medium text-[var(--brand-primary)] dark:text-[var(--marketing-accent)] hover:underline"
                      >
                        {t('clearAll')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ─── Dynamic Category Reel ─── */}
      <CategoryReel categories={realCategories} locale={locale} />

      {/* ─── 3YESES Video Player Section (with CTAs) ─── */}
      <div className="relative z-10 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <div className="text-center mb-14">
            <span className="marketing-pill inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] font-semibold marketing-accent-text mb-6 shadow-sm backdrop-blur-md">
              <SwoopingTick className="w-[1.125rem] h-[1.125rem] shrink-0" />
              {t('watchEyebrow')}
            </span>
            <h2 className="marketing-hero-title text-4xl md:text-6xl font-bold mb-5 leading-[1.05] tracking-tighter">
              {t('videoSectionSeeThe')}{' '}
              <span className="marketing-yes-accent">
                {t('videoSectionExperience')}
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed">
              {t('videoSectionDescription')}
            </p>
          </div>

          {/* Double-Bezel video player shell */}
          <div className="rounded-[2.5rem] bg-light-surface dark:bg-dark-surface ring-1 ring-slate-300/60 dark:ring-[var(--marketing-surface-strong)] backdrop-blur-xl p-2 md:p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="aspect-video rounded-[calc(2.5rem-0.375rem)] overflow-hidden bg-gray-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <VideoPlayer
                url="/videos/Welcome.mp4"
                showLogo={false}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* CTA row below the player (Talent Hub intro + CTAs) */}
          <div className="mt-8 max-w-3xl mx-auto text-center">
            <p className="text-base text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {t('talentHubIntro')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={buildLocalizedPath(locale, '/search-results')}
                className="group relative flex items-center gap-2 text-white rounded-full pl-6 pr-2 py-3 font-semibold text-base shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl active:scale-[0.97]"
                style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent))' }}
              >
                <span>{t('visitTalentHub') || 'Visit the Talent Hub'}</span>
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                  <UserPlus className="w-4 h-4" />
                </span>
              </a>

              <a
                href={buildLocalizedPath(locale, '/search-results')}
                className="marketing-pill group flex items-center gap-2 px-6 py-3 rounded-full ring-1 ring-[var(--marketing-pill-border)] font-semibold text-base text-gray-700 dark:text-slate-50 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                style={{ color: 'var(--brand-primary)', boxShadow: 'none' }}
              >
                <Users className="w-4 h-4" />
                <span>{t('ctaBrowseTalent') || 'Browse Talent'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome / Pitch Section */}
      <div className="relative z-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.5rem] bg-light-surface dark:bg-dark-surface border border-slate-300/60 dark:border-[var(--marketing-surface-strong)] shadow-[0_16px_48px_rgba(0,0,0,0.14)] px-6 md:px-10 lg:px-14 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col justify-start h-full min-h-[320px]">
                <h2 className="marketing-hero-title text-4xl md:text-6xl font-bold mb-7 leading-[1.05] tracking-tighter">
                  {t('findYourNextJob')}{' '}
                  <span className="block marketing-yes-accent">
                    {t('elevateYourCareer')}
                  </span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-md">
                  {t('joinThousands')}{' '}
                  {t('supportCreativeJourney')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {/* Primary CTA — filled gradient pill */}
                  <a
                    href={buildLocalizedPath(locale, '/signup')}
                    className="group relative inline-flex items-center gap-2 text-white rounded-full pl-7 pr-2 py-3.5 font-semibold text-base shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl active:scale-[0.98]"
                    style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent))' }}
                  >
                    <span>{t('joinNow')}</span>
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                      <UserPlus className="w-4 h-4" />
                    </span>
                  </a>
                  {/* Secondary CTA — visible ghost */}
                  <a
                    href={buildLocalizedPath(locale, '/search-results')}
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full ring-2 ring-[var(--brand-primary)] font-semibold text-base text-[var(--brand-primary)] dark:text-[var(--marketing-accent)] dark:ring-[var(--marketing-pill-border)] bg-transparent hover:bg-[var(--brand-primary)]/[0.06] dark:hover:bg-red-950/30 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                  >
                    <Users className="w-4 h-4" />
                    <span>{t('learnMore')}</span>
                  </a>
                </div>
              </div>
            
              <div className="rounded-[2rem] overflow-hidden border border-slate-300/60 dark:border-[var(--marketing-surface-strong)] shadow-[0_12px_40px_rgba(0,0,0,0.16)] bg-light-surface dark:bg-dark-surface p-3">
                <HeroSlideshow />
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
  )
}
