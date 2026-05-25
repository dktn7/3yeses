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
    <div className="home-bg-decoration absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="homeAbBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.22" />
            <stop offset="55%" stopColor="var(--brand-to)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="homeAbW1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="homeAbW2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-to)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.08" />
          </linearGradient>
          <radialGradient id="homeAbGlow" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="var(--marketing-bg-canvas)" />
        <rect width="1440" height="900" fill="var(--marketing-bg-glow-top)" />
          <rect width="1440" height="900" fill="url(#homeAbBg)" />
          <rect width="1440" height="900" fill="url(#homeAbGlow)" />
          <path d="M0 600 C240 520 480 660 720 590 C960 520 1200 620 1440 560 L1440 900 L0 900 Z" fill="url(#homeAbW1)" opacity="0.34" />
          <path d="M0 700 C320 640 560 740 800 680 C1040 620 1280 710 1440 670 L1440 900 L0 900 Z" fill="url(#homeAbW2)" opacity="0.26" />
          <path d="M0 56 C360 108 720 28 1080 74 C1260 98 1380 70 1440 82 L1440 0 L0 0 Z" fill="var(--hero-top-wave, var(--brand-from))" opacity="0.16" />
          <circle cx="200" cy="150" r="200" fill="var(--brand-to)" opacity="0.14" />
          <circle cx="1250" cy="700" r="260" fill="var(--brand-from)" opacity="0.12" />
          <circle cx="720" cy="400" r="280" fill="var(--brand-glow)" opacity="0.06" />
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
    router.push(`/${locale}/search-results?${params.toString()}`)
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
            <span className="marketing-pill inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] font-semibold mb-10 shadow-sm backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <SwoopingTick className="marketing-accent-text w-[1.125rem] h-[1.125rem] shrink-0" />
              <span className="marketing-accent-text">{t('forTalent.title')}</span>
            </span>

              <h1 className="marketing-hero-title mb-8 text-6xl font-bold leading-[1.02] tracking-tighter dark:[text-shadow:0_6px_22px_rgba(0,0,0,0.36)] md:text-8xl lg:text-9xl">
                3<span className="marketing-logo-accent">YES</span>ES
            </h1>

            {/* Dynamic Headline */}
            <DynamicHeadline />

            <p className="marketing-hero-muted mx-auto mb-14 max-w-2xl text-lg leading-relaxed dark:[text-shadow:0_2px_14px_rgba(0,0,0,0.18)] md:text-xl">