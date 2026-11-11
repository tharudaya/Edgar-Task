import { Router } from 'express';
import { z } from 'zod';
import { getSummary } from '../summary/service';

const MAX_TICKERS = 10;

const summaryQuery = z.object({
  tickers: z
    .string()
    .transform((v) => [
      ...new Set(v.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean)),
    ])
    .pipe(z.array(z.string()).min(1).max(MAX_TICKERS)),
});

export const summaryRouter = Router();

summaryRouter.get('/filings/summary', async (req, res) => {
  const { tickers } = summaryQuery.parse(req.query);
  res.json(await getSummary(tickers));
});