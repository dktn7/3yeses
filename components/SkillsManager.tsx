'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface SkillsManagerProps {
  skills: string[];
  onUpdate: (skills: string[]) => void;
  suggestions?: string[];
}

export default function SkillsManager({
  skills,
  onUpdate,
  suggestions = [
    'Acting',
    'Singing',
    'Dancing',
    'Voice Over',
    'Modeling',
    'Comedy',
    'Improvisation',
    'Stage Combat',
    'Acrobatics',
    'Musical Instruments',
    'Public Speaking',
    'Character Acting',
  ],
}: SkillsManagerProps) {
  const [newSkill, setNewSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      onUpdate([...skills, trimmedSkill]);
      setNewSkill('');
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onUpdate(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(newSkill);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !skills.includes(suggestion) &&
      suggestion.toLowerCase().includes(newSkill.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Skills & Abilities
        </label>

        {/* Current Skills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--marketing-pill-bg)] dark:bg-[var(--marketing-pill-bg)] text-[var(--marketing-pill-icon)] dark:text-[var(--marketing-pill-icon)] border border-[var(--marketing-pill-border)] rounded-full text-sm font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        {/* Add New Skill */}
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => {
                setNewSkill(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
              placeholder="Type a skill or choose from suggestions..."
            />
            <button
              type="button"
              onClick={() => addSkill(newSkill)}
              className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-light-surface dark:bg-dark-surface border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  className="w-full text-left px-4 py-2 hover-smart-bg text-gray-900 dark:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Add skills that best describe your abilities. Press Enter or click + to add.
        </p>
      </div>

      {/* Quick Add Popular Skills */}
      {skills.length < 5 && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Popular Skills:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !skills.includes(s))
              .slice(0, 6)
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover-smart-bg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
