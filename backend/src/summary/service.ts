import { getCompanyFilings } from '../filings/service';
import { getHistoryFile, getSubmissions, padCik } from '../edgar/submissions';
import { toFilings } from '../filings/normalize';
import { HttpError } from '../libs/errors';
import type { Filing } from '../filings/types';
import { countFormsSince, findLatest, oneYearBefore, toIsoDate } from './summarize';

const MAX_HISTORY_FILES = 5;

async function findLatest10K(cik: number, recent: Filing[]): Promise<Filing | null> {
  const fromRecent = findLatest(recent, '10-K');
  if (fromRecent) return fromRecent;

  const { filings } = await getSubmissions(cik);
  const newestFirst = [...filings.files]
    .sort((a, b) => b.filingTo.localeCompare(a.filingTo))
    .slice(0, MAX_HISTORY_FILES);

  for (const file of newestFirst) {
    const older = toFilings(await getHistoryFile(file.name), cik);
    const found = findLatest(older, '10-K');
    if (found) return found;
  }
  return null;
}

async function summarizeCompany(ticker: string, from: string) {
  const { company, filings } = await getCompanyFilings(ticker);
  const formCounts = countFormsSince(filings, from);
  const latest10K = await findLatest10K(company.cik, filings);

  return {
    ticker: company.ticker,
    cik: padCik(company.cik),
    name: company.name,
    totalFilings: formCounts.reduce((sum, f) => sum + f.count, 0),
    formCounts,
    latest10K: latest10K
      ? { filingDate: latest10K.filingDate, documentUrl: latest10K.documentUrl }
      : null,
  };
}

export async function getSummary(tickers: string[], today = new Date()) {
  const from = oneYearBefore(today);
  const results = await Promise.allSettled(tickers.map((t) => summarizeCompany(t, from)));

  return {
    period: { from, to: toIsoDate(today) },
    companies: results.map((result, i) =>
      result.status === 'fulfilled'
        ? result.value
        : {
          ticker: tickers[i],
          error:
            result.reason instanceof HttpError
              ? result.reason.message
              : 'Could not load filings',
        },
    ),
  };
}