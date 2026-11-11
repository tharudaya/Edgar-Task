export type TickerFile = Record<string, { cik_str: number; ticker: string; title: string }>;

export type FilingColumns = {
  accessionNumber: string[];
  filingDate: string[];
  reportDate: string[];
  form: string[];
  primaryDocument: string[];
  primaryDocDescription: string[];
};

export type HistoryFile = {
  name: string;
  filingCount: number;
  filingFrom: string;
  filingTo: string;
};

export type Submissions = {
  cik: string;
  name: string;
  filings: {
    recent: FilingColumns;
    files: HistoryFile[];
  };
};