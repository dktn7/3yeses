'use client'

import React from 'react'
import { X } from 'lucide-react'
import type { TalentFilters } from '@/types/index.ts'

interface ActiveFiltersProps {
  filters: TalentFilters
  selectedCategory: string
  onRemoveFilter: (filterType: string, value?: string) => void
  onClearAll: () => void
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  selectedCategory,
  onRemoveFilter,
  onClearAll,
}) => {
  const getActiveFilters = () => {
    const activeFilters: { type: string; value: string; label: string }[] = []

    // Category
    if (selectedCategory) {
      activeFilters.push({
        type: 'category',
        value: selectedCategory,
        label: `Category: ${selectedCategory}`,
      })
    }

    // Gender
    if (filters.gender?.length) {
      filters.gender.forEach((gender) => {
        activeFilters.push({
          type: 'gender',
          value: gender,
          label: `Gender: ${gender}`,
        })
      })
    }

    // Body Type
    if (filters.bodyType?.length) {
      filters.bodyType.forEach((bodyType) => {
        activeFilters.push({
          type: 'bodyType',
          value: bodyType,
          label: `Body: ${bodyType}`,
        })
      })
    }

    // Age Range
    if (filters.ageRange?.min !== 18 || filters.ageRange?.max !== 100) {
      activeFilters.push({
        type: 'ageRange',
        value: '',
        label: `Age: ${filters.ageRange?.min || 18}-${filters.ageRange?.max || 100}`,
      })
    }

    // Experience Range
    if (filters.experience?.min !== 0 || filters.experience?.max !== 50) {
      activeFilters.push({
        type: 'experience',
        value: '',
        label: `Experience: ${filters.experience?.min || 0}-${filters.experience?.max || 50} years`,
      })
    }

    // Location
    if (filters.location?.trim()) {
      activeFilters.push({
        type: 'location',
        value: '',
        label: `Location: ${filters.location}`,
      })
    }

    // Ethnicity
    if (filters.ethnicity?.length) {
      filters.ethnicity.forEach((eth) => {
        activeFilters.push({
          type: 'ethnicity',
          value: eth,
          label: `Ethnicity: ${eth.replace(/_/g, ' ').toLowerCase()}`,
        })
      })
    }

    // Languages
    if (filters.languages?.length) {
      filters.languages.forEach((lang) => {
        activeFilters.push({
          type: 'languages',
          value: lang,
          label: `Language: ${lang}`,
        })
      })
    }

    // Eye Color
    if (filters.eyeColor?.length) {
      filters.eyeColor.forEach((color) => {
        activeFilters.push({
          type: 'eyeColor',
          value: color,
          label: `Eye: ${color}`,
        })
      })
    }

    // Hair Color
    if (filters.hairColor?.length) {
      filters.hairColor.forEach((color) => {
        activeFilters.push({
          type: 'hairColor',
          value: color,
          label: `Hair: ${color}`,
        })
      })
    }

    // Disabilities
    if (filters.disabilities?.length) {
      filters.disabilities.forEach((disability) => {
        activeFilters.push({
          type: 'disabilities',
          value: disability,
          label: `Accessibility: ${disability}`,
        })
      })
    }

    return activeFilters
  }

  const activeFilters = getActiveFilters()

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4">
      <div className="container mx-auto flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-2">
          Active Filters:
        </span>
        
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.type}-${filter.value}-${index}`}
            className="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-sm"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => onRemoveFilter(filter.type, filter.value)}
              className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <button
          onClick={onClearAll}
          className="ml-auto text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}

export default ActiveFilters
