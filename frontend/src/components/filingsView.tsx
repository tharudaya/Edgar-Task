import { useState, type FormEvent } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchFilings, type SortOrder } from '../api';

const PAGE_SIZE = 25;

export function FilingsView() {
  const [tickerInput, setTickerInput] = useState('AAPL');
  const [ticker, setTicker] = useState('AAPL');
  const [form, setForm] = useState('');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);

  const { data, error, isPending, isFetching } = useQuery({
    queryKey: ['filings', ticker, form, order, page],
    queryFn: () => fetchFilings({ ticker, form, order, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  function changeCompany(e: FormEvent) {
    e.preventDefault();
    const next = tickerInput.trim().toUpperCase();
    if (!next) return;
    setTicker(next);
    setForm('');
    setPage(1);
  }

  function changeForm(value: string) {
    setForm(value);
    setPage(1);
  }

  function toggleOrder() {
    setOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
    setPage(1);
  }

  return (
    <section>
      <div className="toolbar">
        <form onSubmit={changeCompany}>
          <label>
            Ticker
            <input
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              placeholder="e.g. AAPL"
            />
          </label>
          <button type="submit">Show filings</button>
        </form>

        <label>
          Form type
          <select value={form} onChange={(e) => changeForm(e.target.value)} disabled={!data}>
            <option value="">All forms</option>
            {data?.availableForms.map((availableForm) => (
              <option key={availableForm} value={availableForm}>
                {availableForm}
              </option>
            ))}
          </select>
        </label>

        {isFetching && <span className="muted">Loading…</span>}
      </div>

      {error && <p className="error">{error.message}</p>}
      {isPending && !error && <p className="muted">Loading filings…</p>}

      {data && !error && (
        <>
          <h2>
            {data.company.name} <span className="muted">CIK {data.company.cik}</span>
          </h2>
          {data.coverage.hasOlderHistory && (
            <p className="muted">
              Showing EDGAR's recent filings, back to {data.coverage.oldestFilingDate}. Older
              filings exist on EDGAR but aren't loaded.
            </p>
          )}

          <table>
            <thead>
              <tr>
                <th aria-sort={order === 'desc' ? 'descending' : 'ascending'}>
                  <button className="link" onClick={toggleOrder}>
                    Filed {order === 'desc' ? '↓' : '↑'}
                  </button>
                </th>
                <th>Form</th>
                <th>Description</th>
                <th>Period</th>
                <th>Document</th>
              </tr>
            </thead>
            <tbody>
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No filings match this filter.
                  </td>
                </tr>
              )}
              {data.data.map((filing) => (
                <tr key={filing.accessionNumber}>
                  <td>{filing.filingDate}</td>
                  <td>{filing.form}</td>
                  <td>{filing.description ?? '–'}</td>
                  <td>{filing.reportDate ?? '–'}</td>
                  <td>
                    <a href={filing.documentUrl} target="_blank" rel="noreferrer">
                      Open ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              Previous
            </button>
            <span>
              Page {data.pagination.page} of {data.pagination.totalPages} ·{' '}
              {data.pagination.total.toLocaleString()} filings
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}