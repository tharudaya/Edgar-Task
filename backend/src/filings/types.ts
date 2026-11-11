export type Filing = {
  accessionNumber: string;
  form: string;
  filingDate: string;
  reportDate: string | null;
  description: string | null;
  documentUrl: string;
  indexUrl: string;
};