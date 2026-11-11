import { createCache } from '../libs/cache';
import { HttpError } from '../libs/errors';
import { secFetch } from './http';
import type { TickerFile } from './types';

const TICKERS_URL = 'https://www.sec.gov/files/company_tickers.json';
const DAY = 24 * 60 * 60 * 1000;

export type Company = { ticker: string; cik: number; name: string };

const cache = createCache<Map<string, Company>>(DAY);

export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/\./g, '-');
}

function loadTickers(): Promise<Map<string, Company>> {
  return cache.getOrLoad('all', async () => {
    const data = await secFetch<TickerFile>(TICKERS_URL);
    const map = new Map<string, Company>();
    for (const row of Object.values(data)) {
      map.set(row.ticker, { ticker: row.ticker, cik: row.cik_str, name: row.title });
    }
    return map;
  });
}

export async function findCompany(ticker: string): Promise<Company> {
  const tickers = await loadTickers();
  const company = tickers.get(normalizeTicker(ticker));
  if (!company) throw new HttpError(404, `Unknown ticker: ${ticker}`);
  return company;
}