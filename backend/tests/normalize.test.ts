import { describe, it, expect } from 'vitest';
import { toFilings } from '../src/filings/normalize';
import { normalizeTicker } from '../src/edgar/tickers';
import { padCik } from '../src/edgar/submissions';

describe('toFilings', () => {
  const columns = {
    accessionNumber: ['0000320193-24-000123', '0000320193-24-000100'],
    filingDate: ['2024-11-01', '2024-08-02'],
    reportDate: ['2024-09-28', ''],
    form: ['10-K', '8-K'],
    primaryDocument: ['aapl-20240928.htm', ''],
    primaryDocDescription: ['10-K', ''],
  };

  it('turns columnar data into filing objects', () => {
    const [first] = toFilings(columns, 320193);
    expect(first).toEqual({
      accessionNumber: '0000320193-24-000123',
      form: '10-K',
      filingDate: '2024-11-01',
      reportDate: '2024-09-28',
      description: '10-K',
      documentUrl:
        'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
      indexUrl:
        'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/0000320193-24-000123-index.htm',
    });
  });

  it('uses null for empty fields and falls back to the index page', () => {
    const [, second] = toFilings(columns, 320193);
    expect(second?.reportDate).toBeNull();
    expect(second?.description).toBeNull();
    expect(second?.documentUrl).toBe(second?.indexUrl);
  });
});

describe('helpers', () => {
  it('normalizes tickers', () => {
    expect(normalizeTicker(' brk.b ')).toBe('BRK-B');
  });

  it('pads CIK to 10 digits', () => {
    expect(padCik(320193)).toBe('0000320193');
  });
});