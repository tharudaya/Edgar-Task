import { describe, it, expect } from 'vitest';
import { countFormsSince, findLatest, oneYearBefore } from '../src/summary/summarize';
import type { Filing } from '../src/filings/types';

const filing = (form: string, filingDate: string): Filing => ({
  accessionNumber: `${form}-${filingDate}`,
  form,
  filingDate,
  reportDate: null,
  description: null,
  documentUrl: '',
  indexUrl: '',
});

const filings = [
  filing('4', '2026-10-01'),
  filing('4', '2026-09-01'),
  filing('10-K', '2026-02-01'),
  filing('10-K', '2025-02-01'),
  filing('8-K', '2025-06-01'),
];

describe('summary helpers', () => {
  it('calculates the date one year back', () => {
    expect(oneYearBefore(new Date('2026-11-11T10:00:00Z'))).toBe('2025-11-11');
  });

  it('counts only filings inside the period, most frequent first', () => {
    expect(countFormsSince(filings, '2025-11-11')).toEqual([
      { form: '4', count: 2 },
      { form: '10-K', count: 1 },
    ]);
  });

  it('finds the latest filing of a form', () => {
    expect(findLatest(filings, '10-K')?.filingDate).toBe('2026-02-01');
  });

  it('returns null when the form does not exist', () => {
    expect(findLatest(filings, '20-F')).toBeNull();
  });
});