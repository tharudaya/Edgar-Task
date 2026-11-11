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
