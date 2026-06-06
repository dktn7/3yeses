import React, { useState } from 'react';
import { X } from 'lucide-react';
import DropdownPanel from './DropdownPanel';

type Option = { label: string; value: string };

type MultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  label?: string;
};

export default function MultiSelect({ options, value, onChange, placeholder, allowCustom = false, label }: MultiSelectProps) {
  const [input, setInput] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [highlighted, setHighlighted] = useState<number>(-1);

  const filteredOptions = options.filter(
    (opt) =>
      !value.includes(opt.value) &&
      (!input || opt.label.toLowerCase().includes(input.toLowerCase()))
  );

  const addValue = (val: string) => {
    if (!val.trim() || value.includes(val)) return;
    onChange([...value, val]);
    setInput('');
    setShowOptions(false);
    setHighlighted(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeValue = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest('.dropdown-panel')
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{label}</div>}
      <div
        className="flex flex-wrap items-center gap-1 px-3 py-2 rounded-full ring-1 ring-[var(--chrome-border)] bg-[var(--chrome-panel)] text-gray-900 dark:text-white cursor-text min-h-[2.5rem] transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--brand-glow)]"
        onClick={() => { setShowOptions(true); inputRef.current?.focus(); }}
      >
        {value.map((val) => {
          // Find the label for this value, or use the value itself
          const option = options.find(o => o.value === val);
          const displayLabel = option?.label || val;
          return (
          <span
            key={val}
            className="flex items-center bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-slate-100 rounded-full px-2 py-0.5 text-xs mr-1 mb-1"
          >
            {displayLabel}
            <button
              type="button"
              className="ml-1 text-xs text-gray-400 hover:text-red-500"
              onClick={e => { e.stopPropagation(); removeValue(val); }}
              aria-label={`Remove ${displayLabel}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
          );
        })}
          <input
            ref={inputRef}
            type="text"
          className="flex-1 bg-transparent outline-none text-sm min-w-[4rem]"
            value={input}
          onChange={e => { setInput(e.target.value); setShowOptions(true); setHighlighted(-1); }}
          onFocus={() => setShowOptions(true)}
          placeholder={placeholder}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (highlighted >= 0 && filteredOptions[highlighted]) {
                addValue(filteredOptions[highlighted].value);
              } else if (input.trim()) {
                addValue(input.trim());
              }
            } else if (e.key === 'ArrowDown') {
              setShowOptions(true);
              setHighlighted(h => Math.min(h + 1, filteredOptions.length - 1));
            } else if (e.key === 'ArrowUp') {
              setHighlighted(h => Math.max(h - 1, 0));
            } else if (e.key === 'Escape') {
              setShowOptions(false);
            } else if (e.key === 'Backspace' && !input && value.length) {
              removeValue(value[value.length - 1]);
            }
          }}
        />
      </div>
      {showOptions && (filteredOptions.length > 0 || (allowCustom && input.trim())) && (
        <DropdownPanel portal anchorRef={inputRef} matchWidth className="p-2">
          {filteredOptions.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                highlighted === i
                  ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                  : 'text-gray-900 dark:text-gray-100'
              } hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]`}
              onClick={(e) => { e.preventDefault(); addValue(opt.value); }}
              onMouseEnter={() => setHighlighted(i)}
            >
              {opt.label}
            </button>
          ))}
          {allowCustom && input.trim() && !options.some(opt => opt.value === input.trim()) && !value.includes(input.trim()) && (
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-[var(--brand-primary)] text-sm hover:bg-[var(--brand-primary)]/10 transition-colors"
              onClick={(e) => { e.preventDefault(); addValue(input.trim()); }}
            >
              {`Add "${input.trim()}"`}
            </button>
          )}
        </DropdownPanel>
      )}
    </div>
  );
}
