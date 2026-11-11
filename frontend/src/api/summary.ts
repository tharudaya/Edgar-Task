import { getData } from './client';
import type { SummaryResponse } from './types';

export function fetchSummary(tickers: string[]) {
  return getData<SummaryResponse>(`/filings/summary?tickers=${encodeURIComponent(tickers.join(','))}`);
}
