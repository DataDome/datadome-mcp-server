export interface DateRange {
  start: Date;
  end: Date;
}

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

/**
 * Parse a time range string into a DateRange object.
 * Supports both short-term (minutes, hours) and long-term (days, months, years) ranges.
 *
 * @param range - Time range string (e.g., "today", "last 7 days", "last 3 months")
 * @returns DateRange with start and end dates
 * @throws Error if the range format is invalid
 */
export function parseTimeRange(range: string): DateRange {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  // Match patterns
  const minutesMatch = range.match(/^last\s+(\d+)\s+minutes?$/i);
  const hoursMatch = range.match(/^last\s+(\d+)\s+hours?$/i);
  const daysMatch = range.match(/^last\s+(\d+)\s+days?$/i);
  const monthsMatch = range.match(/^last\s+(\d+)\s+months?$/i);
  const yearsMatch = range.match(/^last\s+(\d+)\s+years?$/i);

  if (minutesMatch) {
    // up to 48h = 2880 minutes
    const mins = clamp(parseInt(minutesMatch[1], 10), 1, 2880);
    start = new Date(now.getTime() - mins * 60_000);
  } else if (hoursMatch) {
    // up to 48 hours
    const hrs = clamp(parseInt(hoursMatch[1], 10), 1, 48);
    start = new Date(now.getTime() - hrs * 3_600_000);
  } else if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    start = new Date(now);
    start.setDate(start.getDate() - days);
  } else if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    start = new Date(now);
    start.setMonth(start.getMonth() - months);
  } else if (yearsMatch) {
    const years = parseInt(yearsMatch[1], 10);
    start = new Date(now);
    start.setFullYear(start.getFullYear() - years);
  } else if (/^today$/i.test(range)) {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  } else if (/^yesterday$/i.test(range)) {
    start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
  } else if (/^this\s+week$/i.test(range)) {
    start = new Date(now);
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Calculate days to subtract to get back to Monday (Monday as start of week)
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
  } else if (/^this\s+month$/i.test(range) || /^month$/i.test(range)) {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  } else if (/^this\s+quarter$/i.test(range) || /^quarter$/i.test(range)) {
    const currentMonth = now.getMonth();
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    start = new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
  } else if (/^this\s+year$/i.test(range) || /^year$/i.test(range)) {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else if (/^last\s+week$/i.test(range)) {
    start = new Date(now);
    start.setDate(start.getDate() - 7);
  } else if (/^last\s+month$/i.test(range)) {
    start = new Date(now);
    start.setMonth(start.getMonth() - 1);
  } else if (/^last\s+quarter$/i.test(range)) {
    start = new Date(now);
    start.setMonth(start.getMonth() - 3);
  } else if (/^last\s+year$/i.test(range)) {
    start = new Date(now);
    start.setFullYear(start.getFullYear() - 1);
  } else {
    throw new Error(
      `Invalid 'range' qualifier: "${range}". ` +
        `Supported formats: "today", "yesterday", "this week", "this month", "this quarter", "this year", ` +
        `"last week", "last month", "last quarter", "last year", ` +
        `"last X minutes", "last X hours", "last X days", "last X months", "last X years".`
    );
  }

  return { start, end };
}

export function formatDateForApi(date: Date): string {
  return date.toISOString().split(".")[0] + "Z";
}
