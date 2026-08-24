/** Date helpers ported from the design's `fmt`, `fmtLong` and `daysTo`. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses an ISO `YYYY-MM-DD` as local midnight, as the design does. */
export function parseISO(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Aug 26" */
export function fmt(value: string | null | undefined): string {
  const date = parseISO(value);
  if (!date) return '—';
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "Aug 26, 2026" */
export function fmtLong(value: string | null | undefined): string {
  const date = parseISO(value);
  if (!date) return '—';
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Local midnight today. The design pinned this to a constant; we use the real date. */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Whole days from today until `value`. Negative means overdue. */
export function daysTo(value: string | null | undefined, from: Date = today()): number | null {
  const date = parseISO(value);
  if (!date) return null;
  return Math.round((date.getTime() - from.getTime()) / 86400000);
}

export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function monthLabel(date: Date): string {
  const FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${FULL[date.getMonth()]} ${date.getFullYear()}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('');
}
