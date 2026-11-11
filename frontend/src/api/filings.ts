import { getData } from './client';
import type { FilingsResponse, SortOrder } from './types';

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
  return getData<FilingsResponse>(
    `/companies/${encodeURIComponent(params.ticker)}/filings?${query}`,
  );
}
