"use client";

import React from 'react';
import { CheckCircle2, X, Search } from 'lucide-react';
import DropdownPanel from './DropdownPanel';

interface Props {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

// Comprehensive list of world languages (ISO 639 + common names)
const LANGUAGES = [
  // Major world languages
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Mandarin Chinese', 'Cantonese Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
  'Bengali', 'Urdu', 'Punjabi', 'Tamil', 'Telugu', 'Marathi', 'Gujarati',
  // European
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech',
  'Slovak', 'Hungarian', 'Romanian', 'Bulgarian', 'Croatian', 'Serbian',
  'Slovenian', 'Albanian', 'Greek', 'Turkish', 'Ukrainian', 'Belarusian',
  'Lithuanian', 'Latvian', 'Estonian', 'Icelandic', 'Irish', 'Welsh',
  'Scottish Gaelic', 'Basque', 'Catalan', 'Galician', 'Maltese',
  'Luxembourgish', 'Bosnian', 'Macedonian', 'Montenegrin',
  // African
  'Swahili', 'Amharic', 'Yoruba', 'Igbo', 'Hausa', 'Zulu', 'Xhosa',
  'Afrikaans', 'Somali', 'Tigrinya', 'Oromo', 'Shona', 'Lingala',
  'Wolof', 'Twi', 'Kinyarwanda',
  // Asian
  'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Filipino', 'Tagalog',
  'Khmer', 'Lao', 'Burmese', 'Nepali', 'Sinhala', 'Tibetan',
  'Mongolian', 'Kazakh', 'Uzbek', 'Georgian', 'Armenian', 'Azerbaijani',
  // Middle Eastern
  'Persian', 'Kurdish', 'Pashto', 'Hebrew',
  // Sign languages
  'British Sign Language', 'American Sign Language', 'International Sign',
  // Other
  'Latin', 'Esperanto', 'Hawaiian', 'Māori', 'Samoan', 'Tongan', 'Fijian',
  'Creole', 'Pidgin',
].sort();

export default function LanguageMultiSelect({ value, onChange, placeholder }: Props) {
  const [input, setInput] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close suggestions on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        !target.closest('.dropdown-panel')
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = LANGUAGES.filter(
    l => !value.includes(l) && l.toLowerCase().includes(input.toLowerCase())
  );

  // Also allow adding custom languages not in the predefined list
  const inputTrimmed = input.trim();
  const isCustom = inputTrimmed.length > 1
    && !value.some(v => v.toLowerCase() === inputTrimmed.toLowerCase())
    && !LANGUAGES.some(l => l.toLowerCase() === inputTrimmed.toLowerCase());

  const add = (l: string) => {
    if (!value.includes(l)) onChange([...value, l]);
    setInput('');
    setShowSuggestions(false);
  };

  const addCustom = () => {
    if (inputTrimmed && !value.some(v => v.toLowerCase() === inputTrimmed.toLowerCase())) {
      // Capitalize first letter
      const formatted = inputTrimmed.charAt(0).toUpperCase() + inputTrimmed.slice(1);
      onChange([...value, formatted]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const remove = (l: string) => onChange(value.filter(v => v !== l));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) {
        add(filtered[0]);
      } else if (isCustom) {
        addCustom();
      }
    }
  };

  return (
    <div ref={wrapperRef}>
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map(v => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-[rgba(127,29,29,0.18)] text-[var(--brand-primary)] dark:text-red-100 border border-[var(--marketing-pill-border)] dark:border-red-500/25 text-sm font-medium shadow-sm"
          >
            <CheckCircle2 size={14} className="text-[var(--brand-primary)] dark:text-red-300" />
            {v}
            <button type="button" onClick={() => remove(v)} className="ml-0.5 hover:text-red-500 dark:hover:text-red-200 transition-colors">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Search languages...'}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--marketing-surface)] dark:bg-[var(--marketing-surface)] text-gray-900 dark:text-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--marketing-ring)] focus:border-transparent transition-all"
          />
        </div>

        {showSuggestions && (filtered.length > 0 || isCustom) && (
          <DropdownPanel
            portal
            anchorRef={inputRef}
            matchWidth
            maxHeight="14rem"
            className="mt-1 overflow-hidden p-1 bg-[var(--marketing-surface)] dark:bg-[rgba(17,24,39,0.98)] backdrop-blur-xl"
          >
            {filtered.slice(0, 20).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => add(l)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-900 dark:text-gray-100 hover:bg-slate-100/80 dark:hover:bg-[rgba(185,28,28,0.16)] hover:text-gray-950 dark:hover:text-red-100 active:bg-slate-200/90 dark:active:bg-[rgba(185,28,28,0.24)] transition-colors"
              >
                {l}
              </button>
            ))}
            {isCustom && (
              <button
                type="button"
                onClick={addCustom}
                className="w-full text-left px-3 py-2 rounded-xl text-sm text-[var(--brand-primary)] dark:text-red-200 font-medium border-t border-[var(--marketing-pill-border)] hover:bg-slate-100/80 dark:hover:bg-[rgba(185,28,28,0.16)] active:bg-slate-200/90 dark:active:bg-[rgba(185,28,28,0.24)] transition-colors"
              >
                + Add &ldquo;{inputTrimmed}&rdquo; as custom language
              </button>
            )}
          </DropdownPanel>
        )}
      </div>
    </div>
  );
}
