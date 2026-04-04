"use client";

import React from 'react';
import { CheckCircle2, X, Search } from 'lucide-react';

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

  // Close suggestions on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
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
          <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-red-900/30 text-blue-700 dark:text-red-300 text-sm font-medium">
            <CheckCircle2 size={14} className="text-green-500" />
            {v}
            <button type="button" onClick={() => remove(v)} className="ml-0.5 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Search languages...'}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
          />
        </div>

        {showSuggestions && (filtered.length > 0 || isCustom) && (
          <div className="absolute z-50 mt-1 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-56 overflow-auto">
            {filtered.slice(0, 20).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => add(l)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-red-900/20 text-sm text-gray-900 dark:text-white transition-colors"
              >
                {l}
              </button>
            ))}
            {isCustom && (
              <button
                type="button"
                onClick={addCustom}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-red-900/20 text-sm text-blue-600 dark:text-red-400 font-medium border-t border-gray-100 dark:border-gray-800"
              >
                + Add &ldquo;{inputTrimmed}&rdquo; as custom language
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
