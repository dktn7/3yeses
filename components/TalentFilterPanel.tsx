'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import SkillMultiSelect from './SkillMultiSelect';
import MultiSelect from './MultiSelect';
import LocationAutocomplete from './LocationAutocomplete';

export interface TalentFilters {
  gender: string[];
  bodyType: string[];
  ethnicity: string[];
  ageRange: { min: number; max: number };
  heightRange: { min: number; max: number };
  experience: { min: number; max: number };
  location: string;
  eyeColor: string[];
  hairColor: string[];
  skills: string[];
  languages: string[];
  disabilities: string[];
}

export const defaultFilters: TalentFilters = {
  gender: [],
  bodyType: [],
  ethnicity: [],
  ageRange: { min: 5, max: 80 },
  heightRange: { min: 150, max: 200 },
  experience: { min: 0, max: 20 },
  location: '',
  eyeColor: [],
  hairColor: [],
  skills: [],
  languages: [],
  disabilities: [],
};

interface TalentFilterPanelProps {
  filters: TalentFilters;
  onFiltersChange: (filters: TalentFilters) => void;
  onClose?: () => void;
  onApply?: () => void;
  showHeader?: boolean;
  compact?: boolean;
}

export default function TalentFilterPanel({
  filters,
  onFiltersChange,
  onClose,
  onApply,
  showHeader = true,
  compact = false,
}: TalentFilterPanelProps) {
  const [filterTab, setFilterTab] = useState<'main' | 'more'>('main');
  const [agePreset, setAgePreset] = useState<string | null>(null);
  const [heightPreset, setHeightPreset] = useState<string | null>(null);
  const [experiencePreset, setExperiencePreset] = useState<string | null>(null);

  const setFilters = (updater: (prev: TalentFilters) => TalentFilters) => {
    onFiltersChange(updater(filters));
  };

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
    setAgePreset(null);
    setHeightPreset(null);
    setExperiencePreset(null);
  };

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.gender?.length) count++;
    if (filters.bodyType?.length) count++;
    if (filters.ethnicity?.length) count++;
    if (filters.ageRange?.min !== 5 || filters.ageRange?.max !== 80) count++;
    if (filters.heightRange?.min !== 150 || filters.heightRange?.max !== 200) count++;
    if (filters.experience?.min !== 0 || filters.experience?.max !== 20) count++;
    if (filters.eyeColor?.length) count++;
    if (filters.hairColor?.length) count++;
    if (filters.skills?.length) count++;
    if (filters.languages?.length) count++;
    if (filters.disabilities?.length) count++;
    if (filters.location) count++;
    return count;
  }, [filters]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--chrome-border)] bg-[var(--chrome-panel)] shadow-[0_10px_30px_rgba(15,23,42,0.12)] animate-in fade-in slide-in-from-top-2 duration-200 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.06),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(185,28,28,0.08),transparent_35%)]" />
      <div className="relative">
      {/* Header with Close */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filter Talents
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-[var(--brand-primary)] text-white text-xs rounded-full">{activeFilterCount}</span>
            )}
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-[var(--brand-primary)]/8 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      {/* Tab Navigation / Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <button
          type="button"
          onClick={() => setFilterTab('main')}
          className={`group text-left px-4 py-3 rounded-xl border transition-all ${
            filterTab === 'main'
            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/8 dark:bg-[var(--brand-primary)]/14 shadow-[0_8px_24px_rgba(37,99,235,0.10)]'
            : 'border-[var(--chrome-border)] bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/8'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${filterTab === 'main' ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>1</span>
            <span className={`text-sm font-semibold ${filterTab === 'main' ? 'text-[var(--brand-primary)]' : 'text-gray-700 dark:text-gray-300'}`}>Main Filters</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Identity, skills, location, appearance</p>
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('more')}
          className={`group text-left px-4 py-3 rounded-xl border transition-all ${
            filterTab === 'more'
              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/8 dark:bg-[var(--brand-primary)]/14 shadow-[0_8px_24px_rgba(37,99,235,0.10)]'
              : 'border-[var(--chrome-border)] bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/8'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${filterTab === 'more' ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>2</span>
            <span className={`text-sm font-semibold ${filterTab === 'more' ? 'text-[var(--brand-primary)]' : 'text-gray-700 dark:text-gray-300'}`}>More Filters</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Age, height, experience, accessibility</p>
        </button>
      </div>

      {/* Active Tag Chips */}
      {activeFilterCount > 0 && (
        <div className="mb-4 rounded-xl border border-[var(--chrome-border)] bg-white/70 dark:bg-white/5 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Active Filters</div>
          <div className="flex flex-wrap gap-1.5">
            {!!filters.gender?.length && <span className="px-2 py-1 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-slate-100">Gender</span>}
            {!!filters.bodyType?.length && <span className="px-2 py-1 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-slate-100">Body Type</span>}
            {!!filters.skills?.length && <span className="px-2 py-1 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-slate-100">Skills</span>}
            {!!filters.location && <span className="px-2 py-1 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-slate-100">Location</span>}
            {(filters.ageRange?.min !== 5 || filters.ageRange?.max !== 80) && <span className="px-2 py-1 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-slate-100">Age</span>}
            {(filters.heightRange?.min !== 150 || filters.heightRange?.max !== 200) && <span className="px-2 py-1 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-slate-100">Height</span>}
            {(filters.experience?.min !== 0 || filters.experience?.max !== 20) && <span className="px-2 py-1 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-slate-100">Experience</span>}
            {!!filters.disabilities?.length && <span className="px-2 py-1 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:bg-[var(--brand-primary)]/16 dark:text-slate-100">Accessibility</span>}
          </div>
        </div>
      )}

      {/* TAB 1: Main Filters */}
      {filterTab === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4 rounded-xl border border-[var(--chrome-border)] bg-white/70 dark:bg-white/5 p-3">
            {/* Quick Filters: Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Gender</label>
              <div className="flex flex-wrap gap-1.5">
                {['male', 'female', 'non-binary', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      const current = filters.gender || [];
                      const updated = current.includes(g) ? current.filter(x => x !== g) : [...current, g];
                      setFilters(prev => ({ ...prev, gender: updated }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      filters.gender?.includes(g)
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                        : 'bg-gray-100/90 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.10]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filters: Body Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Body Type</label>
              <div className="flex flex-wrap gap-1.5">
                {['slim', 'athletic', 'average', 'curvy', 'muscular'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      const current = filters.bodyType || [];
                      const updated = current.includes(b) ? current.filter(x => x !== b) : [...current, b];
                      setFilters(prev => ({ ...prev, bodyType: updated }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      filters.bodyType?.includes(b)
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                        : 'bg-gray-100/90 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.10]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 rounded-xl border border-[var(--chrome-border)] bg-white/70 dark:bg-white/5 p-3">
            {/* Skills */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Skills</label>
              <SkillMultiSelect
                value={filters.skills || []}
                onChange={(vals) => setFilters(prev => ({ ...prev, skills: vals }))}
                placeholder="Type to search skills..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Location</label>
              <div className="flex gap-1">
                <LocationAutocomplete
                  value={filters.location || ''}
                  onChange={(v) => setFilters(prev => ({ ...prev, location: v }))}
                  placeholder="City or region..."
                />
                <button
                  type="button"
                  className="px-2 py-1.5 rounded-lg bg-gray-100/90 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.10] text-sm flex-shrink-0"
                  title="Use my location"
                  onClick={async () => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                          const data = await res.json();
                          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
                          setFilters(prev => ({ ...prev, location: city }));
                        } catch { /* ignore */ }
                      });
                    }
                  }}
                >
                  📍
                </button>
              </div>
            </div>

            {/* Appearance Dropdowns - Compact Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ethnicity</label>
                <MultiSelect
                  options={[
                    { label: 'White/Caucasian', value: 'WHITE_CAUCASIAN' },
                    { label: 'Black/African', value: 'BLACK_AFRICAN' },
                    { label: 'Asian', value: 'ASIAN' },
                    { label: 'Hispanic/Latino', value: 'HISPANIC_LATINO' },
                    { label: 'Middle Eastern', value: 'MIDDLE_EASTERN' },
                    { label: 'Mixed', value: 'MIXED_MULTIRACIAL' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                  value={filters.ethnicity || []}
                  onChange={(vals) => setFilters(prev => ({ ...prev, ethnicity: vals }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Eye Color</label>
                <MultiSelect
                  options={[
                    { label: 'Blue', value: 'Blue' },
                    { label: 'Brown', value: 'Brown' },
                    { label: 'Green', value: 'Green' },
                    { label: 'Hazel', value: 'Hazel' },
                    { label: 'Gray', value: 'Gray' },
                  ]}
                  value={filters.eyeColor || []}
                  onChange={(vals) => setFilters(prev => ({ ...prev, eyeColor: vals }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Hair Color</label>
                <MultiSelect
                  options={[
                    { label: 'Black', value: 'Black' },
                    { label: 'Brown', value: 'Brown' },
                    { label: 'Blonde', value: 'Blonde' },
                    { label: 'Red', value: 'Red' },
                    { label: 'Gray', value: 'Gray' },
                  ]}
                  value={filters.hairColor || []}
                  onChange={(vals) => setFilters(prev => ({ ...prev, hairColor: vals }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Languages</label>
                <MultiSelect
                  options={[
                    { label: 'English', value: 'English' },
                    { label: 'Spanish', value: 'Spanish' },
                    { label: 'French', value: 'French' },
                    { label: 'German', value: 'German' },
                    { label: 'Mandarin', value: 'Mandarin' },
                    { label: 'Japanese', value: 'Japanese' },
                  ]}
                  value={filters.languages || []}
                  onChange={(vals) => setFilters(prev => ({ ...prev, languages: vals }))}
                  placeholder="Any"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: More Filters (Age, Height, Experience) */}
      {filterTab === 'more' && (
        <div className="space-y-5">
          {/* Age - Single Input + Range Presets + Range Inputs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Age</label>
              {(filters.ageRange?.min !== 5 || filters.ageRange?.max !== 80) && (
                <button type="button" onClick={() => { setFilters(prev => ({ ...prev, ageRange: { min: 5, max: 80 } })); setAgePreset(null); }} className="text-xs text-[var(--brand-primary)]">Reset</button>
              )}
            </div>
            <div className="mb-3">
              <input
                type="number"
                min="5"
                max="80"
                value={filters.ageRange?.min || 25}
                onChange={(e) => setFilters(prev => ({ ...prev, ageRange: { min: parseInt(e.target.value) || 25, max: parseInt(e.target.value) || 25 } }))}
                className="w-full px-3 py-2 rounded-lg ring-1 ring-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white text-center text-base mb-2"
              />
              <div className="text-xs text-gray-400">Looking for talent aged {filters.ageRange?.min || 25}</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: 'Any', min: 5, max: 80, key: 'any' },
                { label: '5-17', min: 5, max: 17, key: 'child' },
                { label: '18-25', min: 18, max: 25, key: 'young' },
                { label: '25-35', min: 25, max: 35, key: 'adult' },
                { label: '35-50', min: 35, max: 50, key: 'middle' },
                { label: '50+', min: 50, max: 80, key: 'senior' },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => { setFilters(prev => ({ ...prev, ageRange: { min: preset.min, max: preset.max } })); setAgePreset(preset.key); }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    agePreset === preset.key ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100/90 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.10]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min="5" max="80" value={filters.ageRange?.min || 5}
                onChange={(e) => { setFilters(prev => ({ ...prev, ageRange: { min: parseInt(e.target.value) || 5, max: prev.ageRange?.max || 80 } })); setAgePreset(null); }}
                className="w-16 px-2 py-1 rounded ring-1 ring-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white text-sm text-center"
              />
              <span className="text-xs text-gray-400">to</span>
              <input type="number" min="5" max="80" value={filters.ageRange?.max || 80}
                onChange={(e) => { setFilters(prev => ({ ...prev, ageRange: { min: prev.ageRange?.min || 5, max: parseInt(e.target.value) || 80 } })); setAgePreset(null); }}
                className="w-16 px-2 py-1 rounded ring-1 ring-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white text-sm text-center"
              />
              <span className="text-xs text-gray-400">years</span>
            </div>
          </div>

          {/* Height - Single Input + Range Presets + Range Inputs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Height</label>
              {(filters.heightRange?.min !== 150 || filters.heightRange?.max !== 200) && (
                <button type="button" onClick={() => { setFilters(prev => ({ ...prev, heightRange: { min: 150, max: 200 } })); setHeightPreset(null); }} className="text-xs text-[var(--brand-primary)]">Reset</button>
              )}
            </div>
            <div className="mb-3">
              <input
                type="number"
                min="100"
                max="250"
                value={filters.heightRange?.min || 170}
                onChange={(e) => setFilters(prev => ({ ...prev, heightRange: { min: parseInt(e.target.value) || 170, max: parseInt(e.target.value) || 170 } }))}
                className="w-full px-3 py-2 rounded-lg ring-1 ring-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white text-center text-base mb-2"
              />
              <div className="text-xs text-gray-400">Looking for talent {filters.heightRange?.min || 170} cm tall</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: 'Any', min: 150, max: 200, key: 'any' },
                { label: '<160', min: 150, max: 160, key: 'short' },
                { label: '160-170', min: 160, max: 170, key: 'medium' },
                { label: '170-180', min: 170, max: 180, key: 'average' },
                { label: '180+', min: 180, max: 220, key: 'tall' },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => { setFilters(prev => ({ ...prev, heightRange: { min: preset.min, max: preset.max } })); setHeightPreset(preset.key); }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    heightPreset === preset.key ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.10]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min="100" max="250" value={filters.heightRange?.min || 150}
                onChange={(e) => { setFilters(prev => ({ ...prev, heightRange: { min: parseInt(e.target.value) || 150, max: prev.heightRange?.max || 200 } })); setHeightPreset(null); }}
                className="w-16 px-2 py-1 rounded ring-1 ring-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white text-sm text-center"
              />
              <span className="text-xs text-gray-400">to</span>
              <input type="number" min="100" max="250" value={filters.heightRange?.max || 200}
                onChange={(e) => { setFilters(prev => ({ ...prev, heightRange: { min: prev.heightRange?.min || 150, max: parseInt(e.target.value) || 200 } })); setHeightPreset(null); }}
                className="w-16 px-2 py-1 rounded ring-1 ring-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white text-sm text-center"
              />
              <span className="text-xs text-gray-400">cm</span>
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Experience</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Any', min: 0, max: 20, key: 'any' },
                { label: 'Beginner', min: 0, max: 2, key: 'beginner' },
                { label: '2-5 yrs', min: 2, max: 5, key: 'some' },
                { label: '5-10 yrs', min: 5, max: 10, key: 'experienced' },
                { label: '10+ yrs', min: 10, max: 30, key: 'veteran' },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => { setFilters(prev => ({ ...prev, experience: { min: preset.min, max: preset.max } })); setExperiencePreset(preset.key); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    experiencePreset === preset.key ? 'bg-[var(--brand-primary)] text-white shadow-md' : 'bg-gray-100/90 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.10]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Accessibility / Disabilities</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Wheelchair User', value: 'wheelchair' },
                { label: 'Visual Impairment', value: 'visual' },
                { label: 'Hearing Impairment', value: 'hearing' },
                { label: 'Mobility Aid', value: 'mobility' },
                { label: 'Limb Difference', value: 'limb_difference' },
                { label: 'Dwarfism', value: 'dwarfism' },
                { label: 'Other', value: 'other' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const current = filters.disabilities || [];
                    const updated = current.includes(option.value) ? current.filter(x => x !== option.value) : [...current, option.value];
                    setFilters(prev => ({ ...prev, disabilities: updated }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filters.disabilities?.includes(option.value)
                      ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                      : 'bg-gray-100/90 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.10]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--chrome-border)]">
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-[var(--brand-primary)]/6 dark:hover:bg-white/5 transition-colors"
        >
          Clear All
        </button>
        {onApply && (
          <button
            type="button"
            onClick={onApply}
            className="px-5 py-2.5 bg-[var(--brand-primary)] hover:brightness-110 text-white rounded-xl text-sm font-semibold shadow-lg transition-all"
          >
            Apply Filters
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
