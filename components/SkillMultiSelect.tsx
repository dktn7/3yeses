"use client";

import React from 'react';
import { X } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function SkillMultiSelect({ value, onChange, placeholder }: Props) {
  const [input, setInput] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [allSkills, setAllSkills] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch all available skills from database
  React.useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/talent/skills');
        if (res.ok) {
          const data = await res.json();
          setAllSkills(Array.isArray(data.skills) ? data.skills : []);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSkills();
  }, []);

  const filteredSuggestions = allSkills.filter(
    skill => !value.includes(skill) && 
    skill.toLowerCase().includes(input.toLowerCase())
  );

  const addSkill = (skill: string) => {
    if (!value.includes(skill)) {
      onChange([...value, skill]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        addSkill(input.trim());
      }
    }
  };

  const removeSkill = (s: string) => onChange(value.filter(v => v !== s));

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map(s => (
          <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
            {s}
            <button 
              type="button"
              onClick={() => removeSkill(s)} 
              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input 
          ref={inputRef}
          type="text"
          value={input} 
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Loading skills...' : (placeholder || 'Type to search skills...')}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent transition-all"
        />
        {showSuggestions && (filteredSuggestions.length > 0 || input.trim()) && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white text-sm transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  {skill}
                </button>
              ))
            ) : input.trim() ? (
              <button
                type="button"
                onClick={() => addSkill(input.trim())}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm transition-colors"
              >
                + Add "{input.trim()}" as new skill
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
