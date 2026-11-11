import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchSummary } from '../api/summary';
import type { CompanySummary } from '../api/types';

const DEFAULT_TICKERS = 'AAPL, SPOT, JPM';
const KEY_FORMS = ['10-K', '10-Q', '8-K', '20-F', '6-K'];

function parseTickers(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[\s,]+/)
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean),
    ),
  ];
}

function countOf(company: CompanySummary, form: string): number {
  return company.formCounts.find((f) => f.form === form)?.count ?? 0;
}

function otherCount(company: CompanySummary): number {
  return company.totalFilings - KEY_FORMS.reduce((sum, f) => sum + countOf(company, f), 0);
}

export function SummaryView() {
  const [input, setInput] = useState(DEFAULT_TICKERS);
  const [tickers, setTickers] = useState(() => parseTickers(DEFAULT_TICKERS));

  const { data, error, isPending } = useQuery({
    queryKey: ['summary', tickers],
    queryFn: () => fetchSummary(tickers),
    enabled: tickers.length > 0,
  });

  console.log(error);


  function submit() {
    const next = parseTickers(input);
    if (next.length === 0) return;
    setTickers(next);
  }

  return (
    <section>
      <form className="toolbar" onSubmit={(e) => {
        e.preventDefault(); submit()
      }}>
        <label>
          Tickers (up to 10)
          <input value={input} onChange={(e) => setInput(e.target.value)} size={40} />
        </label>
        <button type="submit">Compare</button>
      </form>

      {error && <p className="error">{error.message}</p>}
      {isPending && !error && <p className="muted">Loading summary…</p>}

      {data && (
        <>
          <p className="muted">
            Filings from {data.period.from} to {data.period.to}
          </p>

          <table>
            <thead>
              <tr>
                <th>Company</th>
                {KEY_FORMS.map((keyForm) => (
                  <th key={keyForm} className="num">
                    {keyForm}
                  </th>
                ))}
                <th className="num">Other</th>
                <th className="num">Total</th>
                <th>Latest 10-K</th>
              </tr>
            </thead>
            <tbody>
              {data.companies.map((company) =>
                'error' in company ? (
                  <tr key={company.ticker}>
                    <td>{company.ticker}</td>
                    <td colSpan={KEY_FORMS.length + 3} className="error">
                      {company.error}
                    </td>
                  </tr>
                ) : (
                  <tr key={company.ticker}>
                    <td>
                      <strong>{company.ticker}</strong>
                      <div className="muted">{company.name}</div>
                    </td>
                    {KEY_FORMS.map((f) => (
                      <td key={f} className="num">
                        {countOf(company, f).toLocaleString()}
                      </td>
                    ))}
                    <td className="num">{otherCount(company).toLocaleString()}</td>
                    <td className="num">{company.totalFilings.toLocaleString()}</td>
                    <td>
                      {company.latest10K ? (
                        <a href={company.latest10K.documentUrl} target="_blank" rel="noreferrer">
                          {company.latest10K.filingDate} ↗
                        </a>
                      ) : (
                        <span className="muted">
                          None{countOf(company, '20-F') > 0 ? ' (files 20-F)' : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>

          <h3>All form types</h3>
          {data.companies.map(
            (company) =>
              !('error' in company) && (
                <details key={company.ticker}>
                  <summary>
                    {company.ticker} · {company.formCounts.length} form types
                  </summary>
                  <ul>
                    {company.formCounts.map((formCount) => (
                      <li key={formCount.form}>
                        {formCount.form}: {formCount.count.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </details>
              ),
          )}
        </>
      )}
    </section>
  );
}