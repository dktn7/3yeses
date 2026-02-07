"use client";

import React, { useEffect, useRef } from "react";
import RangeSlider from "./RangeSlider.tsx";
import SkillMultiSelect from './SkillMultiSelect.tsx';
import LocationAutocomplete from './LocationAutocomplete.tsx';

interface AdvancedSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gender: string[];
  toggleGender: (g: string) => void;
  bodyType: string[];
  toggleBodyType: (b: string) => void;
  ethnicity: string;
  setEthnicity: (e: string) => void;
  age: [number, number];
  setAge: (vals: [number, number]) => void;
  experience: [number, number];
  setExperience: (vals: [number, number]) => void;
  skills: string;
  setSkills: (s: string) => void;
  languages: string;
  setLanguages: (l: string) => void;
  onApply: () => void;
  onClear: () => void;
}

const genderOptions = ["male", "female", "non-binary", "other"];
const bodyTypeOptions = ["slim", "athletic", "average", "curvy", "plus-size", "muscular"];

export default function AdvancedSearchPanel({
  isOpen,
  onClose,
  gender,
  toggleGender,
  bodyType,
  toggleBodyType,
  ethnicity,
  setEthnicity,
  age,
  setAge,
  experience,
  setExperience,
  skills,
  setSkills,
  languages,
  setLanguages,
  onApply,
  onClear,
}: AdvancedSearchPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div
      ref={panelRef}
      className="absolute left-0 mt-2 z-40 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 animate-fadeIn"
      style={{ minWidth: 320 }}
      tabIndex={-1}
    >
      {/* Pointer arrow */}
      <div className="absolute -top-2 left-8 w-4 h-4 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700 rotate-45 z-10"></div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Advanced Filters</h2>
      <div className="space-y-6">
        {/* Gender */}
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Gender</div>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGender(g)}
                className={`px-4 py-2 rounded-full border text-sm transition-all duration-150 ${gender.includes(g)
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}
                aria-pressed={gender.includes(g)}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Body Type */}
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Body Type</div>
          <div className="flex flex-wrap gap-2">
            {bodyTypeOptions.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBodyType(b)}
                className={`px-4 py-2 rounded-full border text-sm transition-all duration-150 ${bodyType.includes(b)
                  ? "bg-primary-blue text-white border-primary-blue"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}
                aria-pressed={bodyType.includes(b)}
              >
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Ethnicity */}
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Ethnicity</div>
          <input
            type="text"
            value={ethnicity}
            onChange={(e) => setEthnicity(e.target.value)}
            placeholder="Ethnicity (comma separated)"
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        {/* Age */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Age</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">{age[0]} - {age[1]}</span>
          </div>
          <RangeSlider
            min={0}
            max={100}
            step={1}
            values={age}
            onChange={setAge}
            ariaLabel="Age"
          />
        </div>
        {/* Experience */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Experience (years)</span>
            <span className="text-xs text-gray-600 dark:text-gray-300">{experience[0]} - {experience[1]}</span>
          </div>
          <RangeSlider
            min={0}
            max={50}
            step={1}
            values={experience}
            onChange={setExperience}
            ariaLabel="Experience"
          />
        </div>
        {/* Skills */}
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Skills</div>
          <SkillMultiSelect value={skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []} onChange={(vals) => setSkills(vals.join(', '))} placeholder="Add skill" />
        </div>
        {/* Location (autocomplete) */}
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Location</div>
          <LocationAutocomplete value={''} onChange={() => {}} placeholder="City, State" />
        </div>
        {/* Languages */}
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Languages</div>
          <input
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="Languages (comma separated)"
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-8 gap-2">
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={onApply}
          className="flex-1 px-4 py-2 rounded-xl bg-primary-blue text-white text-sm font-semibold shadow hover:bg-primary-blueHover transition-all"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
