import { useCallback } from "react";

interface RunOptimisticOptions<TSnapshot> {
  captureSnapshot: () => TSnapshot;
  applyOptimistic: () => void;
  request: () => Promise<void>;
  rollback: (snapshot: TSnapshot) => void;
  onSuccess?: () => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
  onSettled?: () => void | Promise<void>;
  minimumPendingMs?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useOptimisticMutation() {
  const runOptimistic = useCallback(async <TSnapshot>(options: RunOptimisticOptions<TSnapshot>) => {
    const startedAt = Date.now();
    const snapshot = options.captureSnapshot();

    options.applyOptimistic();

    try {
      await options.request();

      if (options.minimumPendingMs && options.minimumPendingMs > 0) {
        const elapsed = Date.now() - startedAt;
        const remaining = options.minimumPendingMs - elapsed;
        if (remaining > 0) {
          await sleep(remaining);
        }
      }

      await options.onSuccess?.();
      return true;
    } catch (error) {
      options.rollback(snapshot);
      await options.onError?.(error);
      return false;
    } finally {
      await options.onSettled?.();
    }
  }, []);

  return {
    runOptimistic,
  };
}
