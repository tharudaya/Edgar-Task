import { config } from '../config';
import { HttpError } from '../libs/errors';

export async function secFetch<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': config.secUserAgent, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new HttpError(502, 'Could not reach SEC EDGAR');
  }

  if (res.status === 404) throw new HttpError(404, 'Not found on SEC EDGAR');
  if (!res.ok) throw new HttpError(502, `SEC EDGAR responded with ${res.status}`);

  return (await res.json()) as T;
}