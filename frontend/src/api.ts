export type Filing = {
  accessionNumber: string;
  form: string;
  filingDate: string;
  reportDate: string | null;
  description: string | null;
  documentUrl: string;
  indexUrl: string;
};

export type FilingsResponse = {
  company: { ticker: string; cik: string; name: string };
  data: Filing[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  availableForms: string[];
  coverage: { oldestFilingDate: string | null; hasOlderHistory: boolean };
};

export type CompanySummary = {
  ticker: string;
  cik: string;
  name: string;
  totalFilings: number;
  formCounts: { form: string; count: number }[];
  latest10K: { filingDate: string; documentUrl: string } | null;
};

export type SummaryResponse = {
  period: { from: string; to: string };
  companies: (CompanySummary | { ticker: string; error: string })[];
};

export type SortOrder = 'asc' | 'desc';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body as T;
}

export function fetchFilings(params: {
  ticker: string;
  form: string;
  order: SortOrder;
  page: number;
  pageSize: number;
}) {
  const query = new URLSearchParams({
    order: params.order,
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.form) query.set('form', params.form);
  return getJson<FilingsResponse>(
    `/companies/${encodeURIComponent(params.ticker)}/filings?${query}`,
  );
}

export function fetchSummary(tickers: string[]) {
  return getJson<SummaryResponse>(`/filings/summary?tickers=${encodeURIComponent(tickers.join(','))}`);
}