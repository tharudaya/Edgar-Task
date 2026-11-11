import { createCache } from '../libs/cache';
import { findCompany, type Company } from '../edgar/tickers';
import { getSubmissions } from '../edgar/submissions';
import { toFilings } from './normalize';
import type { Filing } from './types';

export type CompanyFilings = {
  company: Company;
  filings: Filing[];
  hasOlderHistory: boolean;
};

const cache = createCache<Omit<CompanyFilings, 'company'>>(10 * 60 * 1000);

export async function getCompanyFilings(ticker: string): Promise<CompanyFilings> {
  const company = await findCompany(ticker);

  const data = await cache.getOrLoad(String(company.cik), async () => {
    const subs = await getSubmissions(company.cik);
    return {
      filings: toFilings(subs.filings.recent, company.cik),
      hasOlderHistory: subs.filings.files.length > 0,
    };
  });

  return { company, ...data };
}