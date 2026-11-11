# Prompt log

I used **Claude (claude.ai)** in a single conversation while working on this assignment. This log
is **condensed and paraphrased**, and the full code is in the repo. I ran each step locally and
checked it against the real EDGAR data before moving on.

---

## Part 1. Planning

**Me:** Explained the requirments. Let's go through what we need to build, why, and how.

**Claude:** The task has three parts. A backend that resolves tickers to CIKs, fetches filings from
EDGAR and exposes two endpoints. A React UI on top. And documentation. It closely mirrors Data
Tooling's work, which is taking external data, normalizing it and exposing it through a clean API.
Likely edge cases are Spotify, which may not file 10-Ks as a foreign issuer, JPMorgan, which files a
very large number of documents, and the SEC's User-Agent and rate-limit requirements.

**Me:** Is Node with Express enough for the backend? And should we use Next.js?

**Claude:** Express is a good fit, as long as the business logic stays separate from the routes.
I wouldn't use Next.js here. The task describes a standalone API with a UI on top, which matches
a separate Express service and a Vite React client.

**Me:** Let's make a step-by-step plan.

**Claude:** Six steps. Setup, the EDGAR client, the filings endpoint, the summary endpoint, the
frontend, and documentation. Each step ends with something working and a commit.

**Me:** Why do we need Vitest? I want best practices and good libraries, but with minimal setup
and nothing over-engineered.

**Claude:** Vitest runs the tests and works with TypeScript and ES modules without extra config.
Supertest tests the HTTP contract. We can skip dotenv by using Node's `--env-file`, and skip CORS
by using the Vite proxy.

**Decisions:**
- **Backend:** Express 5, Zod, Vitest, Supertest
- **Frontend:** React, Vite, TanStack Query, plain CSS
- **Structure:** thin routes, with the core logic in pure, testable functions

---

## Part 2. Building

**Me:** Next step, the client that talks to the SEC.

**Claude:** We need four pieces. A ticker-to-CIK lookup from `company_tickers.json`, SEC requests
with a User-Agent and timeout, an in-memory cache, and a function that converts EDGAR's columnar
data into filing objects. The cache stores the request promise, so concurrent requests for the
same company share one SEC call.

```ts
getOrLoad(key: string, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  const value = load();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  value.catch(() => store.delete(key));
  return value;
}
```

The normalizer turns each index across the arrays into one filing. Empty values become `null`, and
the link falls back to the filing index when there is no primary document.

```ts
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
```

**Me:** I'm getting "Cannot find module '../lib/cache'".

**Claude:** The import expects the file at `src/lib/cache.ts`. Check that the file is in that folder
and restart the TypeScript server.

**Me:** Fixed. Here's the output from running the client against AAPL, SPOT and JPM.

**Claude:** JPMorgan has over 26,000 filings in `recent` and 72 history files, and its oldest
recent filing is exactly one year old. This confirms that EDGAR's `recent` block covers at least
12 months. So the 12-month counts can use `recent` alone. The filings list should also use `recent`
and include a `coverage` field. We should cache the normalized list, so large filers aren't
converted again on every request.

**Me:** Agreed. Let's build the filings endpoint.

**Claude:** A thin route with Zod validation, a pure function for filtering, sorting and pagination,
and a shared error handler. Form matching ignores case and dashes but keeps amendments separate.

```ts
export function normalizeForm(form: string): string {
  return form.toUpperCase().replace(/[\s-]/g, '');
}
```

**Me:** Next, the summary endpoint.

**Claude:** Use `Promise.allSettled`, so one unknown ticker returns an error for that company without
failing the whole request.

```ts
const results = await Promise.allSettled(tickers.map((t) => summarizeCompany(t, from)));
```

Return form counts as a sorted array, because JavaScript reorders number-like object keys such as
`"4"`. For the latest 10-K, check `recent` first and then up to 5 history files.

**Me:** Here's the real response for AAPL, SPOT and JPM.

**Claude:** Apple's latest 10-K is 2026-11-03 and JPMorgan's is 2026-02-13. Spotify returns `null`,
because it files 20-F as a foreign issuer. The UI should explain that, so it doesn't look like a bug.

**Me:** Should we use SCSS or Tailwind for the frontend?

**Claude:** Plain CSS is enough for a small internal UI, and it keeps the components readable.
Import the stylesheet in `main.tsx`.

**Built:** a filings view with a ticker input, form filter, server-side sort and pagination, and a
summary comparison table with the key forms as columns and the rest grouped as "Other".

---

## Part 3. Documentation

**Me:** Let's add the README. Also, why do we need a `.env` file with my name and email?

**Claude:** The SEC requires a User-Agent with contact details, or it rejects the request. It belongs
in `.env` because it's personal and differs for each person running the project. `.env.example`
documents the setting.

**Me:** Now a short NOTES.md, and this prompt log.

**Claude:** Drafted both, covering the key decisions, what we found in the data, limitations and next
steps.