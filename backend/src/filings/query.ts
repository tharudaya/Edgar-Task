import type { Filing } from './types';

export type FilingsQuery = {
  forms: string[];
  order: 'asc' | 'desc';
  page: number;
  pageSize: number;
};

export function normalizeForm(form: string): string {
  return form.toUpperCase().replace(/[\s-]/g, '');
}

export function queryFilings(filings: Filing[], query: FilingsQuery) {
  const wanted = new Set(query.forms.map(normalizeForm));
  const filtered =
    wanted.size > 0 ? filings.filter((f) => wanted.has(normalizeForm(f.form))) : filings;

  const sorted = [...filtered].sort((a, b) =>
    query.order === 'asc'
      ? a.filingDate.localeCompare(b.filingDate)
      : b.filingDate.localeCompare(a.filingDate),
  );

  const total = sorted.length;
  const start = (query.page - 1) * query.pageSize;

  return {
    data: sorted.slice(start, start + query.pageSize),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export function listForms(filings: Filing[]): string[] {
  return [...new Set(filings.map((f) => f.form))].sort();
}