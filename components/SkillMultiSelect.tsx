"use client";

import React from 'react';
import { X } from 'lucide-react';
import DropdownPanel from './DropdownPanel';

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
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest('.dropdown-panel')
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <div className="relative" ref={containerRef}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map(s => (
          <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full text-xs font-medium">
            {s}
            <button 
              type="button"
              onClick={() => removeSkill(s)} 
              className="hover:bg-[var(--brand-primary)]/20 rounded-full p-0.5 transition-colors"
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
          className="w-full px-3 py-2 ring-1 ring-slate-900/8 dark:ring-white/[0.08] rounded-full bg-slate-50 dark:bg-gray-900/90 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 transition-all"
        />
        {showSuggestions && (filteredSuggestions.length > 0 || input.trim()) && (
          <DropdownPanel portal anchorRef={inputRef} className="p-2 w-64 max-w-[90vw]">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] text-gray-900 dark:text-gray-100 text-sm transition-colors border-b border-gray-100 dark:border-white/[0.06] last:border-b-0"
                >
                  {skill}
                </button>
              ))
            ) : input.trim() ? (
              <button
                type="button"
                onClick={() => addSkill(input.trim())}
                className="w-full text-left px-3 py-2 hover:bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-sm transition-colors"
              >
                + Add "{input.trim()}" as new skill
              </button>
            ) : null}
          </DropdownPanel>
        )}
      </div>
    </div>
  );
}
