type Entry<T> = { value: Promise<T>; expiresAt: number };

export function createCache<T>(ttlMs: number) {
  const store = new Map<string, Entry<T>>();

  return {
    getOrLoad(key: string, load: () => Promise<T>): Promise<T> {
      const hit = store.get(key);
      if (hit && hit.expiresAt > Date.now()) return hit.value;

      const value = load();
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      value.catch(() => store.delete(key));
      return value;
    },
  };
}