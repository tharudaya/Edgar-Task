import { describe, it, expect } from 'vitest';

import { queryFilings } from '../src/filings/query';
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
  filing('8-K', '2024-03-01'),
  filing('10-K', '2024-02-01'),
  filing('10-Q', '2024-05-01'),
  filing('10-K/A', '2024-04-01'),
];

const base = { forms: [], order: 'desc' as const, page: 1, pageSize: 10 };

describe('queryFilings', () => {
  it('matches form types regardless of dashes and case', () => {
    const { data } = queryFilings(filings, { ...base, forms: ['10k'] });
    expect(data.map((f) => f.form)).toEqual(['10-K']);
  });

  it('sorts by filing date', () => {
    const { data } = queryFilings(filings, { ...base, order: 'asc' });
    expect(data.map((f) => f.filingDate)).toEqual([
      '2024-02-01',
      '2024-03-01',
      '2024-04-01',
      '2024-05-01',
    ]);
  });

  it('paginates', () => {
    const { data, pagination } = queryFilings(filings, { ...base, page: 2, pageSize: 3 });
    expect(data).toHaveLength(1);
    expect(pagination).toEqual({ page: 2, pageSize: 3, total: 4, totalPages: 2 });
  });
});