import { createCache } from '../libs/cache';
import { secFetch } from './http';
import type { FilingColumns, Submissions } from './types';

const TEN_MINUTES = 10 * 60 * 1000;
const submissionsCache = createCache<Submissions>(TEN_MINUTES);
const historyCache = createCache<FilingColumns>(TEN_MINUTES);

export function padCik(cik: number): string {
  return String(cik).padStart(10, '0');
}

export function getSubmissions(cik: number): Promise<Submissions> {
  const url = `https://data.sec.gov/submissions/CIK${padCik(cik)}.json`;
  return submissionsCache.getOrLoad(url, () => secFetch<Submissions>(url));
}

export function getHistoryFile(name: string): Promise<FilingColumns> {
  const url = `https://data.sec.gov/submissions/${name}`;
  return historyCache.getOrLoad(url, () => secFetch<FilingColumns>(url));
}