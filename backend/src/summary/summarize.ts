import type { Filing } from '../filings/types';

export type FormCount = { form: string; count: number };

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function oneYearBefore(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear() - 1, date.getUTCMonth(), date.getUTCDate()));
  return toIsoDate(d);
}

export function countFormsSince(filings: Filing[], from: string): FormCount[] {
  const counts = new Map<string, number>();
  for (const f of filings) {
    if (f.filingDate >= from) counts.set(f.form, (counts.get(f.form) ?? 0) + 1);
  }
  return [...counts]
    .map(([form, count]) => ({ form, count }))
    .sort((a, b) => b.count - a.count || a.form.localeCompare(b.form));
}

export function findLatest(filings: Filing[], form: string): Filing | null {
  let latest: Filing | null = null;
  for (const f of filings) {
    if (f.form === form && (!latest || f.filingDate > latest.filingDate)) latest = f;
  }
  return latest;
}