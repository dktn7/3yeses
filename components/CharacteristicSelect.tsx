"use client";

import { useState, useRef, useEffect } from 'react';

type Props = {
  options: string[];
  value: string | string[] | null | undefined;
  onChange: (v: string | string[] | null) => void;
  placeholder?: string;
  multi?: boolean;
};

export default function CharacteristicSelect({ options, value, onChange, placeholder, multi }: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedArray = Array.isArray(value) ? value : (value ? [value] : []);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()) && !selectedArray.includes(o));

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const add = (opt: string) => {
    if (multi) {
      onChange([...(selectedArray || []), opt]);
      setQuery('');
    } else {
      onChange(opt);
      setQuery('');
      setIsOpen(false);
    }
  };

  const remove = (opt: string) => {
    if (multi) {
      onChange((selectedArray || []).filter(s => s !== opt));
    } else {
      onChange(null);
    }
  };

  return (
    <div ref={containerRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedArray.map((s) => (
          <span key={s} className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-red-900/30 text-blue-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
            <span>{s}</span>
            <button onClick={() => remove(s)} className="text-sm opacity-80">×</button>
          </span>
        ))}
        {!multi && !selectedArray.length && (
          <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-600">{placeholder || 'Select'}</span>
        )}
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || 'Search...'}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
        />
        {isOpen && filtered.length > 0 && (
          <div className="absolute z-40 left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-auto">
            {filtered.map(opt => (
              <button
                key={opt}
                onClick={() => add(opt)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
