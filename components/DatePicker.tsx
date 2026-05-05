"use client";

import React from 'react';
import { addMonths } from 'date-fns/addMonths';
import { subMonths } from 'date-fns/subMonths';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { format } from 'date-fns/format';
import { isSameDay } from 'date-fns/isSameDay';
import { isAfter } from 'date-fns/isAfter';
import { getDay } from 'date-fns/getDay';

interface DatePickerProps {
  value: string; // yyyy-mm-dd
  onChange: (val: string) => void;
  maxDate?: string;
  placeholder?: string;
}

// Parse yyyy-MM-dd as a LOCAL date (avoid UTC-midnight timezone shift)
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Serialize to yyyy-MM-dd in local time
function toLocalIso(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function DatePicker({ value, onChange, maxDate, placeholder = 'Select date of birth' }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const parsedValue = value ? parseLocalDate(value) : null;
  const parsedMax = maxDate ? parseLocalDate(maxDate) : new Date();

  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => parsedValue ?? new Date());
  const [viewMode, setViewMode] = React.useState<'days' | 'months' | 'years'>('years');

  React.useEffect(() => {
    if (value) setDisplayMonth(parseLocalDate(value));
  }, [value]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= currentYear - 100; y--) years.push(y);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-center justify-between px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-light-surface dark:bg-dark-surface text-light-surface dark:text-dark-surface focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <span className={parsedValue ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
          {parsedValue ? format(parsedValue, 'd MMMM yyyy') : placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[60] mt-1 left-0 right-0 bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 select-none">
          {/* Nav header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'years') setDisplayMonth(new Date(displayMonth.getFullYear() - 12, displayMonth.getMonth(), 1));
                else if (viewMode === 'months') setDisplayMonth(new Date(displayMonth.getFullYear() - 1, displayMonth.getMonth(), 1));
                else setDisplayMonth(subMonths(displayMonth, 1));
              }}
              className="p-1.5 rounded-md hover:bg-light-surface/90 dark:hover:bg-dark-surface/90 text-light-surface dark:text-dark-surface text-xl leading-none font-bold"
            >‹</button>

            <div className="flex items-center gap-1 text-sm font-semibold">
              {viewMode === 'years' ? (
                <span className="text-blue-600 dark:text-red-400">
                  {years[years.length - 1]} – {years[0]}
                </span>
              ) : (
                <>
                  <button type="button" onClick={() => setViewMode('months')}
                    className="px-2 py-1 rounded hover:bg-light-surface/90 dark:hover:bg-dark-surface/90 text-light-surface dark:text-dark-surface">
                    {format(displayMonth, 'MMMM')}
                  </button>
                  <button type="button" onClick={() => setViewMode('years')}
                    className="px-2 py-1 rounded hover:bg-light-surface/90 dark:hover:bg-dark-surface/90 text-blue-600 dark:text-red-400">
                    {format(displayMonth, 'yyyy')}
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (viewMode === 'years') setDisplayMonth(new Date(displayMonth.getFullYear() + 12, displayMonth.getMonth(), 1));
                else if (viewMode === 'months') setDisplayMonth(new Date(displayMonth.getFullYear() + 1, displayMonth.getMonth(), 1));
                else setDisplayMonth(addMonths(displayMonth, 1));
              }}
              className="p-1.5 rounded-md hover:bg-light-surface/90 dark:hover:bg-dark-surface/90 text-light-surface dark:text-dark-surface text-xl leading-none font-bold"
            >›</button>
          </div>

          {/* Year grid */}
          {viewMode === 'years' && (
            <div className="max-h-52 overflow-y-auto grid grid-cols-4 gap-1">
              {years.map(y => (
                <button key={y} type="button"
                  onClick={() => { setDisplayMonth(new Date(y, displayMonth.getMonth(), 1)); setViewMode('months'); }}
                  className={`py-1.5 text-sm rounded-md transition-colors ${
                    parsedValue?.getFullYear() === y
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >{y}</button>
              ))}
            </div>
          )}

          {/* Month grid */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2">
              {MONTH_NAMES.map((name, i) => {
                const isSelected = parsedValue && parsedValue.getMonth() === i && parsedValue.getFullYear() === displayMonth.getFullYear();
                const isCurrent = displayMonth.getMonth() === i;
                return (
                  <button key={name} type="button"
                    onClick={() => { setDisplayMonth(new Date(displayMonth.getFullYear(), i, 1)); setViewMode('days'); }}
                    className={`py-2 text-sm rounded-md transition-colors ${
                      isSelected ? 'bg-blue-600 text-white'
                      : isCurrent ? 'border border-blue-400 text-blue-600 dark:text-red-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >{name}</button>
                );
              })}
            </div>
          )}

          {/* Days grid */}
          {viewMode === 'days' && (
            <>
              <div className="grid grid-cols-7 text-center text-xs text-gray-400 dark:text-gray-500 mb-1">
                {DAY_HEADERS.map(d => <div key={d} className="py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {/* Leading blank cells for correct weekday alignment */}
                {Array.from({ length: getDay(startOfMonth(displayMonth)) }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {eachDayOfInterval({ start: startOfMonth(displayMonth), end: endOfMonth(displayMonth) }).map((day: Date) => {
                  const disabled = isAfter(day, parsedMax);
                  const selected = parsedValue && isSameDay(parsedValue, day);
                  return (
                    <button key={toLocalIso(day)} type="button" disabled={disabled}
                      onClick={() => { onChange(toLocalIso(day)); setOpen(false); setViewMode('days'); }}
                      className={`py-1.5 text-sm rounded-md leading-none transition-colors ${
                        selected ? 'bg-blue-600 text-white'
                        : disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {parsedValue ? format(parsedValue, 'd MMM yyyy') : 'No date selected'}
            </span>
            <button type="button" onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
