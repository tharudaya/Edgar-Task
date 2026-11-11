import { Router } from 'express';
import { z } from 'zod';

import { getCompanyFilings } from '../filings/service';
import { listForms, queryFilings } from '../filings/query';
import { padCik } from '../edgar/submissions';

const filingsQuery = z.object({
  form: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : [])),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const filingsRouter = Router();

filingsRouter.get('/companies/:ticker/filings', async (req, res) => {
  const { form, ...rest } = filingsQuery.parse(req.query);
  const { company, filings, hasOlderHistory } = await getCompanyFilings(req.params.ticker);
  const { data, pagination } = queryFilings(filings, { forms: form, ...rest });

  res.json({
    company: { ...company, cik: padCik(company.cik) },
    data,
    pagination,
    availableForms: listForms(filings),
    coverage: {
      oldestFilingDate: filings.at(-1)?.filingDate ?? null,
      hasOlderHistory,
    },
  });
});