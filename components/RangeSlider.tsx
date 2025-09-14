'use client'

import React from 'react'

type Props = {
  min?: number
  max?: number
  step?: number
  values: [number, number]
  onChange: (vals: [number, number]) => void
  ariaLabel?: string
}

export default function RangeSlider({ min = 0, max = 100, step = 1, values, onChange, ariaLabel }: Props) {
  const [low, high] = values

  const handleLow = (v: number) => {
    const newLow = Math.min(v, high)
    onChange([newLow, high])
  }

  const handleHigh = (v: number) => {
    const newHigh = Math.max(v, low)
    onChange([low, newHigh])
  }

  const pct = (v: number) => ((v - min) / (max - min)) * 100

  return (
    <div className="w-full">
  <div className="relative h-14">
        {/* track */}
        <div className="absolute left-0 right-0 top-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        {/* selected range */}
        <div
          className="absolute top-4 h-2 bg-primary-blue rounded-md"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />

        {/* low thumb */}
        <input
          aria-label={ariaLabel ? `${ariaLabel} minimum` : 'minimum value'}
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => handleLow(Number(e.target.value))}
          className="absolute inset-0 w-full h-10 appearance-none bg-transparent z-30 slider-thumb"
          style={{ pointerEvents: 'auto' }}
        />

        {/* high thumb */}
        <input
          aria-label={ariaLabel ? `${ariaLabel} maximum` : 'maximum value'}
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => handleHigh(Number(e.target.value))}
          className="absolute inset-0 w-full h-10 appearance-none bg-transparent z-40 slider-thumb"
          style={{ pointerEvents: 'auto' }}
        />

        {/* Value below low thumb */}
        <div
          className="absolute left-0 w-0"
          style={{ left: `calc(${pct(low)}% - 1.25rem / 2)` }}
        >
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 px-2 py-0.5 rounded shadow border border-gray-200 dark:border-gray-700 pointer-events-none select-none">
            {low}
          </div>
        </div>
        {/* Value below high thumb */}
        <div
          className="absolute left-0 w-0"
          style={{ left: `calc(${pct(high)}% - 1.25rem / 2)` }}
        >
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 px-2 py-0.5 rounded shadow border border-gray-200 dark:border-gray-700 pointer-events-none select-none">
            {high}
          </div>
        </div>
        {/* Custom thumb styling for all browsers */}
        <style jsx>{`
          input[type='range'].slider-thumb::-webkit-slider-thumb {
            height: 1.25rem;
            width: 1.25rem;
            border-radius: 0.375rem;
            background: #fff;
            border: 2px solid #d1d5db;
            box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
            cursor: pointer;
            transition: box-shadow 0.15s;
          }
          input[type='range'].slider-thumb:focus::-webkit-slider-thumb {
            box-shadow: 0 0 0 3px #3b82f6;
            border-color: #3b82f6;
          }
          input[type='range'].slider-thumb::-moz-range-thumb {
            height: 1.25rem;
            width: 1.25rem;
            border-radius: 0.375rem;
            background: #fff;
            border: 2px solid #d1d5db;
            box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
            cursor: pointer;
            transition: box-shadow 0.15s;
          }
          input[type='range'].slider-thumb:focus::-moz-range-thumb {
            box-shadow: 0 0 0 3px #3b82f6;
            border-color: #3b82f6;
          }
          input[type='range'].slider-thumb::-ms-thumb {
            height: 1.25rem;
            width: 1.25rem;
            border-radius: 0.375rem;
            background: #fff;
            border: 2px solid #d1d5db;
            box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
            cursor: pointer;
            transition: box-shadow 0.15s;
          }
          input[type='range'].slider-thumb:focus::-ms-thumb {
            box-shadow: 0 0 0 3px #3b82f6;
            border-color: #3b82f6;
          }
          input[type='range'].slider-thumb:focus {
            outline: none;
          }
        `}</style>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-600 dark:text-gray-300">
        <div>{min}</div>
        <div>{max}</div>
      </div>
    </div>
  )
}
