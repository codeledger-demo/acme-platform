/**
 * Format a Date as an ISO 8601 string (UTC).
 */
export function formatISO(date: Date): string {
  return date.toISOString();
}

/**
 * Format a date as a human-readable relative string (e.g., "3 hours ago", "in 2 days").
 */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const absDiffMs = Math.abs(diffMs);
  const isFuture = diffMs < 0;

  const seconds = Math.floor(absDiffMs / 1_000);
  const minutes = Math.floor(absDiffMs / 60_000);
  const hours = Math.floor(absDiffMs / 3_600_000);
  const days = Math.floor(absDiffMs / 86_400_000);

  let relative: string;

  if (seconds < 5) {
    return 'just now';
  } else if (seconds < 60) {
    relative = `${seconds} seconds`;
  } else if (minutes < 60) {
    relative = minutes === 1 ? '1 minute' : `${minutes} minutes`;
  } else if (hours < 24) {
    relative = hours === 1 ? '1 hour' : `${hours} hours`;
  } else if (days < 30) {
    relative = days === 1 ? '1 day' : `${days} days`;
  } else {
    const months = Math.floor(days / 30);
    relative = months === 1 ? '1 month' : `${months} months`;
  }

  return isFuture ? `in ${relative}` : `${relative} ago`;
}

/**
 * Return a new Date set to the start of the day (00:00:00.000) in UTC.
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Return a new Date set to the end of the day (23:59:59.999) in UTC.
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * Add (or subtract) a number of days to a date. Returns a new Date.
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Calculate the number of whole days between two dates (absolute value).
 */
export function diffInDays(a: Date, b: Date): number {
  const diffMs = Math.abs(a.getTime() - b.getTime());
  return Math.floor(diffMs / 86_400_000);
}
