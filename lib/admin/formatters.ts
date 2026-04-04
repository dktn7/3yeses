/**
 * Admin portal formatting utilities for dates and currency.
 * Defaults to GMT for dates and GBP for currency.
 */

/**
 * Formats a date string or object to GMT/UTC with a (GMT) suffix.
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatAdminDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }
): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GB', {
    ...options,
    timeZone: 'UTC',
  }).format(d) + ' (GMT)';
}

/**
 * Formats a number as GBP currency.
 * @param amount Number to format
 * @param options Intl.NumberFormatOptions
 * @returns Formatted currency string
 */
export function formatAdminCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    ...options,
  }).format(amount);
}

/**
 * Formats a duration in milliseconds to a readable string (e.g. "2h 15m").
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
