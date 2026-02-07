'use client'

import React from 'react'
import SkillMultiSelect from './SkillMultiSelect.tsx'
import MultiSelect from './MultiSelect.tsx'
import LocationAutocomplete from './LocationAutocomplete.tsx'
import { X, SlidersHorizontal } from 'lucide-react'
import type { TalentFilters } from '@/types/index.ts'
type LocalSub = { id: string; name: string; description?: string };
type LocalCategoryGroup = { id: string; name: string; subcategories: LocalSub[] };

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: TalentFilters
  setFilters: React.Dispatch<React.SetStateAction<TalentFilters>>
  categories: LocalCategoryGroup[]
  applyFilters: () => void
  clearFilters: () => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  categories,
  applyFilters,
  clearFilters,
  selectedCategory,
  setSelectedCategory,
}) => {
  const handleRangeChange = (
    key: 'ageRange' | 'experience' | 'heightRange',
    field: 'min' | 'max',
    value: string
  ) => {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return

    setFilters((prev) => {
      const currentRange = prev[key] || { min: 0, max: 0 }
      const newRange = { ...currentRange, [field]: numValue }

      // Ensure min is not greater than max
      if (field === 'min' && newRange.min > (currentRange.max || 0)) {
        newRange.max = newRange.min
      }
      if (field === 'max' && newRange.max < (currentRange.min || 0)) {
        newRange.min = newRange.max
      }

      return { ...prev, [key]: newRange }
    })
  }

  const handleMultiSelectChange = (
    key: 'gender' | 'bodyType' | 'availability',
    value: string
  ) => {
    setFilters((prev) => {
      const currentValues = (prev[key] as string[]) || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]
      return { ...prev, [key]: newValues }
    })
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={20} />
              Filters
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Filters Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-8">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-blue focus:border-primary-blue"
                >
                  <option value="">All Categories</option>
                  {categories.map((group) => (
                    <optgroup key={group.id} label={group.name}>
                      {group.subcategories.map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Gender
                </label>
                <div className="flex flex-wrap gap-2">
                  {['male', 'female', 'non-binary', 'other'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handleMultiSelectChange('gender', gender)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                        filters.gender?.includes(gender)
                          ? 'bg-primary-blue text-white border-primary-blue'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Body Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {['slim', 'athletic', 'average', 'curvy', 'plus-size', 'muscular'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleMultiSelectChange('bodyType', type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors capitalize ${
                        filters.bodyType?.includes(type)
                          ? 'bg-primary-blue text-white border-primary-blue'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Height Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm): {filters.heightRange?.min || 140} - {filters.heightRange?.max || 220}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="140"
                    max="220"
                    value={filters.heightRange?.min || 140}
                    onChange={(e) => handleRangeChange('heightRange', 'min', e.target.value)}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="140"
                    max="220"
                    value={filters.heightRange?.max || 220}
                    onChange={(e) => handleRangeChange('heightRange', 'max', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Age Range Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age Range: {filters.ageRange?.min || 18} - {filters.ageRange?.max || 100}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={filters.ageRange?.min || 18}
                    onChange={(e) => handleRangeChange('ageRange', 'min', e.target.value)}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={filters.ageRange?.max || 100}
                    onChange={(e) => handleRangeChange('ageRange', 'max', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Experience Range Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience (Years): {filters.experience?.min || 0} - {filters.experience?.max || 50}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.experience?.min || 0}
                    onChange={(e) => handleRangeChange('experience', 'min', e.target.value)}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.experience?.max || 50}
                    onChange={(e) => handleRangeChange('experience', 'max', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills
                </label>
                <SkillMultiSelect
                  value={filters.skills || []}
                  onChange={(vals) => setFilters((prev) => ({ ...prev, skills: vals }))}
                  placeholder="Add skill"
                />
              </div>

              {/* Location with city autocomplete and GPS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City / Location
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <LocationAutocomplete
                      value={filters.location || ''}
                      onChange={(v) => setFilters((prev) => ({ ...prev, location: v }))}
                      placeholder="Enter city or use GPS"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md bg-primary-blue text-white hover:bg-primary-blueHover transition-colors"
                    title="Use my location"
                    onClick={async () => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          const { latitude, longitude } = pos.coords;
                          // Use a free geocoding API or your backend to get city name
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const data = await res.json();
                            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
                            setFilters((prev) => ({ ...prev, location: city }));
                          } catch {
                            // ignore
                          }
                        });
                      }
                    }}
                  >
                    📍
                  </button>
                </div>
              </div>

              {/* Ethnicity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ethnicity
                </label>
                <MultiSelect
                  options={[
                    { label: 'White / Caucasian', value: 'WHITE_CAUCASIAN' },
                    { label: 'Black / African', value: 'BLACK_AFRICAN' },
                    { label: 'Asian', value: 'ASIAN' },
                    { label: 'Hispanic / Latino', value: 'HISPANIC_LATINO' },
                    { label: 'Middle Eastern', value: 'MIDDLE_EASTERN' },
                    { label: 'Mixed / Multiracial', value: 'MIXED_MULTIRACIAL' },
                    { label: 'Native American', value: 'NATIVE_AMERICAN' },
                    { label: 'Pacific Islander', value: 'PACIFIC_ISLANDER' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                  value={filters.ethnicity || []}
                  onChange={(vals) => setFilters((prev) => ({ ...prev, ethnicity: vals }))}
                  placeholder="Select ethnicity"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Languages
                </label>
                <MultiSelect
                  options={[
                    { label: 'English', value: 'English' },
                    { label: 'Spanish', value: 'Spanish' },
                    { label: 'French', value: 'French' },
                    { label: 'German', value: 'German' },
                    { label: 'Italian', value: 'Italian' },
                    { label: 'Portuguese', value: 'Portuguese' },
                    { label: 'Chinese (Mandarin)', value: 'Mandarin' },
                    { label: 'Japanese', value: 'Japanese' },
                    { label: 'Arabic', value: 'Arabic' },
                    { label: 'Hindi', value: 'Hindi' },
                    { label: 'Russian', value: 'Russian' },
                  ]}
                  value={filters.languages || []}
                  onChange={(vals) => setFilters((prev) => ({ ...prev, languages: vals }))}
                  placeholder="Select languages"
                />
              </div>

              {/* Accessibility / Disabilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accessibility / Inclusive Casting
                </label>
                <MultiSelect
                  options={[
                    { label: 'Mobility Impairment', value: 'Mobility' },
                    { label: 'Hearing Impairment', value: 'Hearing' },
                    { label: 'Visual Impairment', value: 'Visual' },
                    { label: 'Neurodivergent', value: 'Neurodivergent' },
                    { label: 'Cognitive', value: 'Cognitive' },
                    { label: 'Other', value: 'Other' },
                  ]}
                  value={filters.disabilities || []}
                  onChange={(vals) => setFilters((prev) => ({ ...prev, disabilities: vals }))}
                  placeholder="Select accessibility needs"
                />
              </div>

              {/* Eye Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Eye Color
                </label>
                <MultiSelect
                  options={[
                    { label: 'Amber', value: 'Amber' },
                    { label: 'Blue', value: 'Blue' },
                    { label: 'Brown', value: 'Brown' },
                    { label: 'Gray', value: 'Gray' },
                    { label: 'Green', value: 'Green' },
                    { label: 'Hazel', value: 'Hazel' },
                    { label: 'Red', value: 'Red' },
                  ]}
                  value={filters.eyeColor || []}
                  onChange={(vals) => setFilters((prev) => ({ ...prev, eyeColor: vals }))}
                  placeholder="Select eye color"
                />
              </div>

              {/* Hair Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hair Color
                </label>
                <MultiSelect
                  options={[
                    { label: 'Black', value: 'Black' },
                    { label: 'Blonde', value: 'Blonde' },
                    { label: 'Brown', value: 'Brown' },
                    { label: 'Red', value: 'Red' },
                    { label: 'White', value: 'White' },
                    { label: 'Gray', value: 'Gray' },
                    { label: 'Bald', value: 'Bald' },
                    { label: 'Dyed', value: 'Dyed' },
                  ]}
                  value={filters.hairColor || []}
                  onChange={(vals) => setFilters((prev) => ({ ...prev, hairColor: vals }))}
                  placeholder="Select hair color"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  applyFilters()
                  onClose()
                }}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blueHover transition-colors font-medium text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FilterSidebar
