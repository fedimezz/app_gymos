import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/client";

interface AsyncState<T> {
  data: T | null;
  loading: boolean; // true only on the FIRST load (drives the skeleton)
  refreshing: boolean; // true on pull-to-refresh / manual refetch after data already exists
  error: string | null;
  reload: () => void;
}

/**
 * Runs `fetcher` on mount and again whenever `deps` change. `loading` is
 * only true before the first successful load; after that, refetches (pull-
 * to-refresh, `reload()`) flip `refreshing` instead, so the screen keeps
 * showing the last good data instead of flashing back to a skeleton.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const run = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de charger les données. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);
  const refresh = useCallback(() => run(true), [run]);

  return { data, loading, refreshing, error, reload: data ? refresh : reload };
}
