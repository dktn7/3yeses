export const CATEGORY_TILE_BASE_CLASSES =
  'group p-8 border rounded-xl transition-all duration-200 cursor-pointer min-h-[260px] focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] active:translate-y-0 hover:-translate-y-0.5';

export const CATEGORY_TILE_LIGHT_CLASSES =
  'border-blue-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(248,251,255,0.97)_100%)] text-slate-900 shadow-[0_10px_24px_rgba(59,130,246,0.14)] hover:border-blue-200 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(238,245,255,0.98)_100%)] hover:shadow-[0_16px_32px_rgba(59,130,246,0.18)] focus-visible:ring-blue-500 focus-visible:ring-offset-2';

export const CATEGORY_TILE_DARK_CLASSES =
  'dark:border-white/10 dark:bg-none dark:[background-image:none] dark:bg-[rgba(31,32,36,0.96)] dark:text-white dark:shadow-[0_8px_22px_rgba(0,0,0,0.42)] dark:hover:border-red-500/45 dark:hover:bg-[rgba(31,32,36,0.98)] dark:hover:shadow-[0_12px_28px_rgba(127,29,29,0.18)] dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-[#140809]';

export const CATEGORY_TILE_CLASSES = `${CATEGORY_TILE_BASE_CLASSES} ${CATEGORY_TILE_LIGHT_CLASSES} ${CATEGORY_TILE_DARK_CLASSES}`;

export const CATEGORY_ICON_BOX_BASE_CLASSES = 'p-4 rounded-2xl transition-all duration-200';

export const CATEGORY_ICON_BOX_LIGHT_CLASSES =
  'border border-blue-200/90 bg-white text-[#1d4ed8] shadow-[0_10px_24px_rgba(37,99,235,0.16)] group-hover:border-primary-blue group-hover:bg-primary-blue group-hover:text-white group-hover:shadow-[0_14px_28px_rgba(37,99,235,0.24)] group-hover:scale-[1.03]';

export const CATEGORY_ICON_BOX_DARK_CLASSES =
  'dark:border dark:border-red-500/20 dark:bg-[#232937] dark:text-accent-red dark:shadow-[0_10px_22px_rgba(0,0,0,0.24)] dark:group-hover:border-accent-red dark:group-hover:bg-accent-red dark:group-hover:text-white dark:group-hover:shadow-[0_14px_28px_rgba(127,29,29,0.20)]';

export const CATEGORY_ICON_BOX_CLASSES = `${CATEGORY_ICON_BOX_BASE_CLASSES} ${CATEGORY_ICON_BOX_LIGHT_CLASSES} ${CATEGORY_ICON_BOX_DARK_CLASSES}`;

export const CATEGORY_TITLE_BASE_CLASSES = 'text-base font-semibold tracking-tight transition-colors leading-snug';
export const CATEGORY_TITLE_LIGHT_CLASSES = 'text-slate-900';
export const CATEGORY_TITLE_DARK_CLASSES = 'dark:text-white';
export const CATEGORY_TITLE_CLASSES = `${CATEGORY_TITLE_BASE_CLASSES} ${CATEGORY_TITLE_LIGHT_CLASSES} ${CATEGORY_TITLE_DARK_CLASSES}`;

export const CATEGORY_VIEW_ALL_TITLE_LIGHT_CLASSES = 'text-primary-blue';
export const CATEGORY_VIEW_ALL_TITLE_CLASSES = `${CATEGORY_TITLE_BASE_CLASSES} ${CATEGORY_VIEW_ALL_TITLE_LIGHT_CLASSES} ${CATEGORY_TITLE_DARK_CLASSES}`;

export const CATEGORY_META_BASE_CLASSES = 'text-xs font-medium transition-colors mt-0.5';
export const CATEGORY_META_LIGHT_CLASSES = 'text-slate-500';
export const CATEGORY_META_DARK_CLASSES = 'dark:text-gray-400';
export const CATEGORY_META_CLASSES = `${CATEGORY_META_BASE_CLASSES} ${CATEGORY_META_LIGHT_CLASSES} ${CATEGORY_META_DARK_CLASSES}`;

export const CATEGORY_DESCRIPTION_BASE_CLASSES = 'text-sm transition-colors mt-1 line-clamp-2';
export const CATEGORY_DESCRIPTION_LIGHT_CLASSES = 'text-slate-600';
export const CATEGORY_DESCRIPTION_DARK_CLASSES = 'dark:text-gray-300';
export const CATEGORY_DESCRIPTION_CLASSES = `${CATEGORY_DESCRIPTION_BASE_CLASSES} ${CATEGORY_DESCRIPTION_LIGHT_CLASSES} ${CATEGORY_DESCRIPTION_DARK_CLASSES}`;

export const CATEGORY_ICON_CLASSES = 'w-14 h-14 transition-colors';
