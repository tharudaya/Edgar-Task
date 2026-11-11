export async function getData<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body as T;
}
