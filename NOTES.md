# Notes

## Decisions

- **Express instead of Bun and Elysia.** I'm fastest with Express, and the time was limited. The
  logic is separate from the routes, so switching to Elysia would be a small change.
- **Recent filings only.** The list uses EDGAR's `recent` block, which covers at least 12 months
  or 1,000 filings. Loading the full history would be slow for large filers like JPMorgan. The
  response has a `coverage` field that shows how far back the list goes.
- **Latest 10-K.** I check `recent` first, then up to 5 older history files.
- **Form types.** `10K` and `10-K` match. Amendments like `10-K/A` are kept separate.
- **Summary errors.** An unknown ticker gets its own error, and the other companies still load.
- **Caching.** Tickers are cached for 24 hours and filings for 10 minutes, to keep SEC requests
  low.
- **Simple UI.** Simple UI for the assigment

## What I found

- **Spotify** files 20-F instead of 10-K, so its latest 10-K is `null`. The UI shows
  "None (files 20-F)".
- **JPMorgan** filed over 26,000 documents in the last year, mostly 424B2. This is why I cache the
  normalized list.

## Next steps

- Load older filings on demand.
- Add a rate limiter for SEC requests.
- Share types between backend and frontend.
- Add frontend tests.
- Keep filters in the URL.

## AI usage

I used Claude throughout the assignment as a planning and coding partner. It helped with the architecture and planning, drafting lower-level code and test cases, and discussing trade-offs and issues as they came up. I made the final decisions, ran and tested each step locally, and checked the results against the real EDGAR data. The prompt log is in prompt-log.md. See
`prompt-log.md`.