'use client';

import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';

type IconType = ComponentType<any>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function DashboardPage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('mx-auto w-full max-w-[1420px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9', className)}>
      {children}
    </div>
  );
}

export function DashboardWorkspace({ children, className }: { children: ReactNode; className?: string }) {
  return <DashboardPage className={cx('space-y-7', className)}>{children}</DashboardPage>;
}

export function DashboardHeader({
  eyebrow = 'Your dashboard',
  title,
  description,
  icon: Icon,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: IconType;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="dashboard-page-header">
      <div className="min-w-0 max-w-2xl">
        <p className="dashboard-eyebrow">{Icon && <Icon className="h-4 w-4" />}{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="dashboard-description">{description}</p>}
        {meta && <div className="mt-4">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function DashboardSurface({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={cx('dashboard-surface', className)}>
      <div className={cx('dashboard-surface-inner h-full p-5', innerClassName)}>
        {children}
      </div>
    </div>
  );
}

export function DashboardPanel({
  children,
  className,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <DashboardSurface className={className} innerClassName={compact ? 'p-4' : undefined}>
      {children}
    </DashboardSurface>
  );
}

export function PanelHeading({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-800/70 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function DashboardButton({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
}) {
  const classes = cx(
    'group inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-ring)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variant === 'primary' &&
      'bg-[color:var(--brand-primary)] text-white shadow-[0_18px_36px_-24px_rgba(var(--brand-primary-rgb),0.95)] hover:-translate-y-0.5',
    variant === 'secondary' &&
      'bg-slate-950/7 text-slate-800 ring-1 ring-slate-950/10 hover:bg-slate-950/10 hover:text-[color:var(--brand-primary)] dark:bg-white/8 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-white/12',
    variant === 'ghost' &&
      'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white',
    variant === 'danger' &&
      'bg-red-600 text-white shadow-[0_18px_36px_-24px_rgba(185,28,28,0.9)] hover:-translate-y-0.5 hover:bg-red-700',
    className,
  );

  if (href && disabled) return <span aria-disabled="true" className={cx(classes, 'opacity-50 cursor-not-allowed')}>{children}</span>;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  trend,
}: {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  icon?: IconType;
  trend?: ReactNode;
}) {
  return (
    <DashboardSurface className="relative overflow-hidden" innerClassName="relative overflow-hidden">
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 tabular-nums text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
          {detail && <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{detail}</div>}
        </div>
        {Icon && (
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {trend && <div className="relative mt-4 border-t border-slate-200/70 pt-3 dark:border-slate-800/70">{trend}</div>}
    </DashboardSurface>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: IconType;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50/70 px-5 py-8 text-center dark:bg-slate-900/35">
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: ReactNode; count?: number }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full bg-slate-950/7 p-1 ring-1 ring-slate-950/7 dark:bg-white/7 dark:ring-white/10">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cx(
              'rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
              active
                ? 'bg-[color:var(--brand-primary)] text-white shadow-[0_12px_26px_-18px_rgba(var(--brand-primary-rgb),0.9)]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white',
            )}
          >
            {option.label}
            {typeof option.count === 'number' && <span className="ml-1 opacity-75">{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function DashboardField({
  label,
  error,
  hint,
  children,
}: {
  label: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-300">{error}</p>
      ) : hint ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function inputClass(error?: boolean) {
  return cx(
    'w-full rounded-2xl border bg-light-surface/90 px-4 py-3 text-sm text-slate-950 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-slate-400 focus:ring-2 focus:ring-[color:var(--brand-ring)] dark:bg-dark-surface/90 dark:text-white',
    error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700',
  );
}

export function DashboardToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-slate-50/80 p-4 transition-colors hover:bg-slate-100/80 dark:bg-slate-950/35 dark:hover:bg-slate-900/60">
      <span>
        <span className="block text-sm font-semibold text-slate-950 dark:text-white">{label}</span>
        {description && <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{description}</span>}
      </span>
      <span
        className={cx(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
          checked ? 'bg-[color:var(--brand-primary)]' : 'bg-slate-300 dark:bg-slate-700',
        )}
      >
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <span
          className={cx(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </span>
    </label>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        tone === 'neutral' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        tone === 'brand' && 'bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]',
        tone === 'success' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300',
        tone === 'warning' && 'bg-amber-100 text-amber-800 dark:bg-amber-950/35 dark:text-amber-300',
        tone === 'danger' && 'bg-red-100 text-red-700 dark:bg-red-950/35 dark:text-red-300',
      )}
    >
      {children}
    </span>
  );
}

export function DashboardStatRow({
  items,
}: {
  items: Array<{ label: ReactNode; value: ReactNode; detail?: ReactNode }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <div key={index} className="rounded-[1.5rem] bg-slate-50/80 p-4 dark:bg-slate-950/35">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="mt-2 tabular-nums text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.value}</p>
          {item.detail && <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.detail}</p>}
        </div>
      ))}
    </div>
  );
}

export function DashboardActionCard({
  icon: Icon,
  title,
  description,
  action,
  tone = 'neutral',
}: {
  icon?: IconType;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: 'neutral' | 'accent' | 'warning' | 'danger';
}) {
  const toneClass =
    tone === 'warning'
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-200'
      : tone === 'danger'
        ? 'bg-red-500/10 text-red-700 dark:text-red-200'
        : tone === 'accent'
          ? 'bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]'
          : 'bg-slate-900/7 text-slate-700 dark:bg-white/10 dark:text-slate-200';

  return (
    <div className="group rounded-xl bg-slate-50/80 p-4 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 dark:bg-slate-950/35">
      <div className="flex items-start gap-4">
        {Icon && (
          <span className={cx('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', toneClass)}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
}

export function DashboardLoading() {
  return (
    <DashboardWorkspace>
      <div role="status" aria-label="Loading dashboard" className="space-y-6 motion-safe:animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-5 sm:grid-cols-3">
          {[0, 1, 2].map(item => <div key={item} className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />)}
        </div>
        <div className="h-72 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
      </div>
    </DashboardWorkspace>
  );
}

export function DashboardLoadError({ onRetry }: { onRetry: () => void }) {
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"><p>We couldn’t load this information. Please try again.</p><button type="button" onClick={onRetry} className="mt-2 min-h-10 font-semibold underline underline-offset-4">Try again</button></div>;
}

