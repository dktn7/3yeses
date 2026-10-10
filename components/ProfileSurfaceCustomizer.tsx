'use client';

import type { CSSProperties } from 'react';
import { Palette, RotateCcw, Upload, Sparkles } from 'lucide-react';

export type BackgroundPattern = 'none' | 'dots' | 'hatch' | 'grid' | 'noise';

interface ProfileSurfaceCustomizerProps {
  bannerColor: string;
  bannerPreviewStyle?: CSSProperties;
  backgroundColor: string;
  backgroundPattern: BackgroundPattern;
  backgroundPreviewStyle?: CSSProperties;
  bannerUploading: boolean;
  onBannerColorChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onBackgroundPatternChange: (value: BackgroundPattern) => void;
  onBannerUpload: (file: File) => void;
  onResetBanner: () => void;
  onResetBackground: () => void;
  onResetAll: () => void;
}

const PATTERNS: Array<{
  id: BackgroundPattern;
  label: string;
  preview: (color: string) => CSSProperties;
}> = [
  {
    id: 'none',
    label: 'Solid',
    preview: (color) => ({ backgroundColor: color }),
  },
  {
    id: 'dots',
    label: 'Dots',
    preview: (color) => ({
      backgroundColor: color,
      backgroundImage:
        'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.42) 1px, transparent 0)',
      backgroundSize: '14px 14px',
    }),
  },
  {
    id: 'hatch',
    label: 'Hatch',
    preview: (color) => ({
      backgroundColor: color,
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 10px)',
    }),
  },
  {
    id: 'grid',
    label: 'Grid',
    preview: (color) => ({
      backgroundColor: color,
      backgroundImage: [
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.16) 0 1px, transparent 1px 18px)',
        'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 18px)',
      ].join(', '),
    }),
  },
  {
    id: 'noise',
    label: 'Noise',
    preview: (color) => ({
      backgroundColor: color,
      backgroundImage:
        'linear-gradient(0deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08))',
    }),
  },
];

function ColorSwatch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-[4.25rem] cursor-pointer items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-light-surface/90 px-4 py-3 text-sm shadow-sm transition-colors hover:border-blue-300 dark:border-gray-800 dark:bg-dark-surface/90 dark:hover:border-red-500">
      <span className="flex flex-col">
        <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
          {value}
        </span>
      </span>
      <span className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/70 shadow-sm ring-1 ring-black/5">
        <span className="absolute inset-0" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color`}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </span>
    </label>
  );
}

export default function ProfileSurfaceCustomizer({
  bannerColor,
  bannerPreviewStyle,
  backgroundColor,
  backgroundPattern,
  backgroundPreviewStyle,
  bannerUploading,
  onBannerColorChange,
  onBackgroundColorChange,
  onBackgroundPatternChange,
  onBannerUpload,
  onResetBanner,
  onResetBackground,
  onResetAll,
}: ProfileSurfaceCustomizerProps) {
  const bannerPreview = bannerPreviewStyle || {
    backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #0f172a 100%)',
  };

  const backgroundPreview = backgroundPreviewStyle || {
    backgroundColor: backgroundColor,
  };

  return (
    <section className="mt-6 rounded-[1.75rem] border border-gray-200 bg-white/90 p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-gray-800 dark:bg-zinc-950/75">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-red-300">
            Profile surfaces
          </p>
          <h4 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
            Banner and background
          </h4>
        </div>
        <button
          type="button"
          onClick={onResetAll}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-light-surface px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-dark-surface dark:text-gray-200 dark:hover:border-red-500 dark:hover:text-red-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset all
        </button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[1.5rem] border border-gray-200 bg-light-surface/80 p-4 dark:border-gray-800 dark:bg-dark-surface/70">
          <div
            className="relative overflow-hidden rounded-[1.25rem] border border-white/50 shadow-sm"
            style={bannerPreview}
          >
            <div className="absolute inset-0 bg-black/10 dark:bg-black/25" />
            <div className="relative flex min-h-[7rem] items-end justify-between gap-3 p-4 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                  Banner
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Solid color or uploaded image
                </p>
              </div>
              <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">
                Live preview
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <ColorSwatch value={bannerColor} onChange={onBannerColorChange} label="Banner color" />

            <label className="flex min-h-[4.25rem] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-red-800 dark:bg-red-950/25 dark:text-red-200 dark:hover:bg-red-950/40">
              {bannerUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload banner
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onBannerUpload(file);
                }}
                disabled={bannerUploading}
              />
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Pick a color for a clean banner or upload an image for a richer header.
            </span>
            <button
              type="button"
              onClick={onResetBanner}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset banner
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-gray-200 bg-light-surface/80 p-4 dark:border-gray-800 dark:bg-dark-surface/70">
          <div
            className="relative overflow-hidden rounded-[1.25rem] border border-white/50 shadow-sm"
            style={backgroundPreview}
          >
            <div className="absolute inset-0 bg-black/5 dark:bg-black/30" />
            <div className="relative flex min-h-[7rem] items-end justify-between gap-3 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-700 dark:text-gray-200">
                  Background
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  Color plus optional texture
                </p>
              </div>
              <div className="rounded-full border border-white/20 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-700 backdrop-blur-sm dark:bg-black/35 dark:text-gray-100">
                {backgroundPattern === 'none' ? 'Solid' : backgroundPattern}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <ColorSwatch value={backgroundColor} onChange={onBackgroundColorChange} label="Background color" />
          </div>

          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-red-400" />
              Texture
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => onBackgroundPatternChange(pattern.id)}
                  className={`overflow-hidden rounded-2xl border p-2 text-left transition-all ${
                    backgroundPattern === pattern.id
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:border-red-500 dark:ring-red-900/50'
                      : 'border-gray-200 hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className="h-14 rounded-xl"
                    style={pattern.preview(backgroundColor)}
                  />
                  <div className="mt-2 px-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{pattern.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Patterns work best with a soft base colour so the content area stays readable.
            </span>
            <button
              type="button"
              onClick={onResetBackground}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset background
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-gray-200 bg-gradient-to-br from-white to-blue-50/80 p-4 dark:border-gray-800 dark:from-zinc-950 dark:to-zinc-900">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-red-300">
          <Palette className="h-4 w-4" />
          Live preview
        </div>
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/60 shadow-sm">
            <div className="h-28" style={bannerPreview} />
          </div>
          <div
            className="overflow-hidden rounded-[1.5rem] border border-white/60 p-4 shadow-sm"
            style={backgroundPreview}
          >
            <div className="max-w-[18rem] rounded-2xl bg-white/70 p-3 text-xs font-medium text-gray-700 backdrop-blur-sm dark:bg-black/35 dark:text-gray-100">
              The background preview updates instantly when you change colour or texture.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
