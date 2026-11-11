# EDGAR Filings

A small API and React UI for browsing SEC EDGAR filings by ticker, plus a summary that compares
filing activity across companies.

- **Backend:** Node.js, Express 5, TypeScript, Zod
- **Frontend:** React, Vite, TypeScript, TanStack Query
- **Tests:** Vitest, Supertest

See [NOTES.md](./NOTES.md) for design decisions and trade-offs, and
[prompt-log.md](./prompt-log.md) for the AI prompt log.

## Requirements

- Node.js 20 or newer

## Setup

```bash
npm run setup
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and set `SEC_USER_AGENT` to your name and email. The SEC requires a
User-Agent with contact details and blocks requests without one.

```
PORT=3001
SEC_USER_AGENT="Your Name your.email@example.com"
```

## Run

```bash
npm run dev
```

This starts both apps.

- UI: http://localhost:5173
- API: http://localhost:3001

The Vite dev server proxies `/api/*` to the backend, so no CORS setup is needed.

## Tests

```bash
npm test
```

Tests cover the core logic (normalizing EDGAR's columnar data, filtering, sorting, pagination
and the summary calculations) and the API's validation and error responses. Route tests mock the
SEC layer, so they run without network access.

Type checking:

```bash
npm --prefix backend run typecheck
cd frontend && npx tsc -b
```

## API

### `GET /companies/:ticker/filings`

Returns a paginated list of a company's filings, newest first by default.

| Query param | Description                                                  | Default |
| ----------- | ------------------------------------------------------------ | ------- |
| `form`      | Form type, or a comma-separated list. `10K` matches `10-K`.  | all     |
| `order`     | `desc` or `asc` by filing date                               | `desc`  |
| `page`      | Page number, from 1                                          | `1`     |
| `pageSize`  | Results per page, max 100                                    | `25`    |

```bash
curl "http://localhost:3001/companies/AAPL/filings?form=10-K&pageSize=5"
```

```json
{
  "company": { "ticker": "AAPL", "cik": "0000320193", "name": "Apple Inc." },
  "data": [
    {
      "accessionNumber": "0000320193-26-000026",
      "form": "10-K",
      "filingDate": "2026-11-03",
      "reportDate": "2026-09-26",
      "description": "10-K",
      "documentUrl": "https://www.sec.gov/Archives/edgar/data/320193/000032019326000026/aapl-20260926.htm",
      "indexUrl": "https://www.sec.gov/Archives/edgar/data/320193/000032019326000026/0000320193-26-000026-index.htm"
    }
  ],
  "pagination": { "page": 1, "pageSize": 5, "total": 11, "totalPages": 3 },
  "availableForms": ["10-K", "10-Q", "8-K", "..."],
  "coverage": { "oldestFilingDate": "2015-10-07", "hasOlderHistory": true }
}
```

`coverage` shows how far back the list goes. The list is based on EDGAR's `recent` filings, which
cover at least the last 12 months or 1,000 filings.

### `GET /filings/summary`

For each company, returns the number of filings per form type over the last 12 months and the
date of its latest 10-K.

| Query param | Description                                   |
| ----------- | --------------------------------------------- |
| `tickers`   | Comma-separated tickers, 1 to 10 (required)   |

```bash
curl "http://localhost:3001/filings/summary?tickers=AAPL,SPOT,JPM"
```

```json
{
  "period": { "from": "2025-11-11", "to": "2026-11-11" },
  "companies": [
    {
      "ticker": "AAPL",
      "cik": "0000320193",
      "name": "Apple Inc.",
      "totalFilings": 94,
      "formCounts": [
        { "form": "4", "count": 54 },
        { "form": "8-K", "count": 9 }
      ],
      "latest10K": { "filingDate": "2026-11-03", "documentUrl": "https://www.sec.gov/..." }
    },
    { "ticker": "XXXX", "error": "Unknown ticker: XXXX" }
  ]
}
```

`latest10K` is `null` for companies that don't file 10-Ks, such as Spotify, which files 20-F as a
foreign issuer. An unknown ticker returns an error for that company only, so the others still load.

### Errors

All errors use the same shape.

```json
{ "error": "Unknown ticker: XXXX" }
```

| Status | When                                     |
| ------ | ---------------------------------------- |
| 400    | Invalid query parameters                 |
| 404    | Unknown ticker or route                  |
| 502    | SEC EDGAR is unreachable or returned an error |

## Project structure

```
backend/
  src/
    edgar/      SEC client, ticker lookup, submissions
    filings/    filing model, normalization, query logic, service
    summary/    summary calculations and service
    routes/     Express routes and request validation
    libs/        cache, errors, error handler
  tests/
frontend/
  src/
    api/            fetch client, API types, one file per endpoint
    components/     FilingsView, SummaryView
```