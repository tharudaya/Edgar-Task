import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app';

const app = createApp();

describe('GET /filings/summary', () => {
  it('requires tickers', async () => {
    const res = await request(app).get('/filings/summary');
    expect(res.status).toBe(400);
  });

  it('limits the number of tickers', async () => {
    const tickers = Array.from({ length: 11 }, (_, i) => `T${i}`).join(',');
    const res = await request(app).get(`/filings/summary?tickers=${tickers}`);
    expect(res.status).toBe(400);
  });
});