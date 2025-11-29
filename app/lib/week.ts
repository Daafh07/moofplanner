// Shared helper for consistent week keys in drafts.
export function normalizeWeekValue(week: unknown): string {
  const val = typeof week === 'string' ? week.trim() : '';
  return val.length > 0 ? val : 'no-week';
}
