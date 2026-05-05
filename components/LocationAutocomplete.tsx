"use client";

import React from 'react';
import { MapPin, Search } from 'lucide-react';
import DropdownPanel from './DropdownPanel'

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const POPULAR_CITIES = [
  { name: 'Los Angeles', country: 'USA' },
  { name: 'New York', country: 'USA' },
  { name: 'San Francisco', country: 'USA' },
  { name: 'Chicago', country: 'USA' },
  { name: 'Miami', country: 'USA' },
  { name: 'Atlanta', country: 'USA' },
  { name: 'Houston', country: 'USA' },
  { name: 'London', country: 'UK' },
  { name: 'Paris', country: 'France' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'Madrid', country: 'Spain' },
  { name: 'Rome', country: 'Italy' },
  { name: 'Amsterdam', country: 'Netherlands' },
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Toronto', country: 'Canada' },
  { name: 'Vancouver', country: 'Canada' },
  { name: 'Mexico City', country: 'Mexico' },
  { name: 'Buenos Aires', country: 'Argentina' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Melbourne', country: 'Australia' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Seoul', country: 'South Korea' },
  { name: 'Bangkok', country: 'Thailand' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Dubai', country: 'UAE' },
  { name: 'Mumbai', country: 'India' },
  { name: 'Delhi', country: 'India' },
];

export default function LocationAutocomplete({ value, onChange, placeholder }: Props) {
  const [suggestions, setSuggestions] = React.useState<Array<{ name: string; country: string }>>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!value || value.length < 1) {
      setSuggestions([]);
      return;
    }

    const filtered = POPULAR_CITIES.filter(city =>
      city.name.toLowerCase().includes(value.toLowerCase()) ||
      city.country.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);
  }, [value]);

  const handleSelect = (city: { name: string; country: string }) => {
    onChange(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input 
          ref={inputRef}
          type="text" 
          value={value} 
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder || 'Search city or region...'}
          className="w-full pl-9 pr-3 py-2 rounded-full ring-1 ring-slate-900/8 dark:ring-white/[0.08] bg-slate-50 dark:bg-gray-900/90 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:outline-none transition-all"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-60">
          <DropdownPanel portal anchorRef={inputRef} matchWidth>
            <div className="p-0">
              {suggestions.map((city) => (
                <button
                  key={`${city.name}-${city.country}`}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm transition-colors duration-200 text-gray-700 dark:text-gray-100 hover-smart-bg flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{city.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{city.country}</div>
                  </div>
                </button>
              ))}
            </div>
          </DropdownPanel>
        </div>
      )}
    </div>
  );
}
