'use client';

import React from 'react';
import PhoneInput from 'react-phone-number-input/input';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en.json';
import Image from 'next/image';

interface CustomPhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  error?: boolean;
  placeholder?: string;
}

// Sorted once at module level (longest code first) for reliable detection
const ALL_COUNTRIES = getCountries();
const SORTED_COUNTRIES = ALL_COUNTRIES
  .map(c => ({ c, code: `+${getCountryCallingCode(c)}` }))
  .sort((a, b) => b.code.length - a.code.length);

const LABELS = en as Record<string, string>;

function detectCountryFromE164(e164: string): Country | null {
  const normalised = e164.startsWith('+') ? e164 : `+${e164}`;
  const match = SORTED_COUNTRIES.find(({ code }) => normalised.startsWith(code));
  return match ? match.c : null;
}

export default function CustomPhoneInput({
  value = '',
  onChange,
  className = '',
  error = false,
}: CustomPhoneInputProps) {
  const [country, setCountry] = React.useState<Country>('GB');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Auto-detect country from browser locale on mount
  React.useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const parts = navigator.language.split('-');
    const region = (parts[1] ?? parts[0]).toUpperCase() as Country;
    if (ALL_COUNTRIES.includes(region)) setCountry(region);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-detect country when value changes (handles paste of full international number)
  React.useEffect(() => {
    if (!value) return;
    const detected = detectCountryFromE164(value);
    if (detected && detected !== country) setCountry(detected);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // When country changes from dropdown, strip old code from value and re-emit with new code
  const handleCountryChange = (newCountry: Country) => {
    setCountry(newCountry);
    setDropdownOpen(false);
    setSearch('');
    // Clear the value so user types a fresh local number for the new country
    onChange?.('');
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropdownOpen]);

  const callingCode = `+${getCountryCallingCode(country)}`;
  const countryName = LABELS[country] ?? country;

  const filteredCountries = search.trim()
    ? ALL_COUNTRIES.filter(c => {
        const name = (LABELS[c] ?? c).toLowerCase();
        const code = getCountryCallingCode(c);
        const q = search.toLowerCase().replace('+', '');
        return name.includes(q) || code.includes(q);
      })
    : ALL_COUNTRIES;

  return (
    <div className="space-y-1">
      <div className={`relative flex items-stretch rounded-lg border ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      } bg-light-surface dark:bg-dark-surface overflow-visible focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all ${className}`}>

        {/* Country selector */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(o => !o)}
            aria-label={`Phone country: ${countryName} (${callingCode})`}
            className="flex items-center gap-2 px-3 h-full border-r border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors rounded-l-lg min-w-[90px]"
          >
            <Image
              src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country}.svg`}
              alt={country}
              width={22}
              height={15}
              unoptimized
              className="rounded-sm object-cover shrink-0"
            />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{callingCode}</span>
            <svg className="w-3 h-3 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute z-[70] top-full left-0 mt-1 w-72 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl">
              {/* Search */}
              <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country or code…"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500">No results</p>
                ) : filteredCountries.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCountryChange(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors ${
                      c === country ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <Image
                      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${c}.svg`}
                      alt={c}
                      width={20}
                      height={14}
                      unoptimized
                      className="rounded-sm object-cover shrink-0"
                    />
                    <span className="text-gray-400 dark:text-gray-500 w-10 shrink-0 text-xs">+{getCountryCallingCode(c)}</span>
                    <span className={`truncate ${c === country ? 'font-semibold text-blue-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {LABELS[c] ?? c}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Number input — user types LOCAL number only; PhoneInput formats to E.164 internally */}
        <PhoneInput
          country={country}
          value={value || undefined}
          onChange={(val) => onChange?.(val ?? '')}
          placeholder="e.g. 7911 123456"
          className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm rounded-r-lg"
        />
      </div>

      {/* Helper hint */}
      <p className="text-xs text-gray-400 dark:text-gray-500 pl-1">
        Select your country on the left, then enter your <span className="font-medium">local number</span> — no need to include the country code.
      </p>
    </div>
  );
}
