import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app';
import { HttpError } from '../src/libs/errors';

vi.mock('../src/filings/service', () => ({
  getCompanyFilings: vi.fn(async (ticker: string) => {
    if (ticker === 'NOPE') throw new HttpError(404, 'Unknown ticker: NOPE');
    return {
      company: { ticker: 'AAPL', cik: 320193, name: 'Apple Inc.' },
      filings: [],
      hasOlderHistory: false,
    };
  }),
}));

const app = createApp();

describe('GET /companies/:ticker/filings', () => {
  it('returns a paginated response', async () => {
    const res = await request(app).get('/companies/AAPL/filings');
    expect(res.status).toBe(200);
    expect(res.body.company.cik).toBe('0000320193');
    expect(res.body.pagination.page).toBe(1);
  });

  it('returns 404 for an unknown ticker', async () => {
    const res = await request(app).get('/companies/NOPE/filings');
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid query params', async () => {
    const res = await request(app).get('/companies/AAPL/filings?pageSize=500');
    expect(res.status).toBe(400);
  });
});