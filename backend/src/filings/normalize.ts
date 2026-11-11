import type { FilingColumns } from '../edgar/types';
import type { Filing } from './types';

const ARCHIVES = 'https://www.sec.gov/Archives/edgar/data';

export function toFilings(columns: FilingColumns, cik: number): Filing[] {
  return columns.accessionNumber.map((accessionNumber, i) => {
    const folder = `${ARCHIVES}/${cik}/${accessionNumber.replace(/-/g, '')}`;
    const indexUrl = `${folder}/${accessionNumber}-index.htm`;
    const primaryDocument = columns.primaryDocument[i];

    return {
      accessionNumber,
      form: columns.form[i] ?? '',
      filingDate: columns.filingDate[i] ?? '',
      reportDate: columns.reportDate[i] || null,
      description: columns.primaryDocDescription[i] || null,
      documentUrl: primaryDocument ? `${folder}/${primaryDocument}` : indexUrl,
      indexUrl,
    };
  });
}