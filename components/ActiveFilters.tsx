'use client'

import React from 'react'
import { X } from 'lucide-react'
import type { TalentFilters } from '@/types'

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

    return activeFilters
  }

  const activeFilters = getActiveFilters()

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Active filters:
      </span>
      {activeFilters.map((filter, index) => (
        <div
          key={`${filter.type}-${filter.value}-${index}`}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red rounded-full text-sm border border-primary-blue/20 dark:border-accent-red/20"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            className="hover:bg-primary-blue/20 dark:hover:bg-accent-red/20 rounded-full p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

export default ActiveFilters
