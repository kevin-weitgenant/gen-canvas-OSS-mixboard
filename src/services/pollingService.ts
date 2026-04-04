import type { TaskState } from '../types/zImage';

export interface PollingConfig<T> {
  interval: number;
  getStatus: () => Promise<{ state: TaskState; resultUrls?: T }>;
  onSuccess: (data: T) => void;
  onError: (error: Error) => void;
  onProgress?: (state: TaskState) => void;
}

export function createPollingTask<T>(config: PollingConfig<T>): () => void {
  const { interval, getStatus, onSuccess, onError, onProgress } = config;

  const intervalId = window.setInterval(async () => {
    try {
      const { state, resultUrls } = await getStatus();

      if (state === 'success' && resultUrls) {
        onSuccess(resultUrls);
        clearInterval(intervalId);
      } else if (state === 'fail') {
        onError(new Error('Generation failed'));
        clearInterval(intervalId);
      } else {
        onProgress?.(state);
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
      clearInterval(intervalId);
    }
  }, interval);

  return () => clearInterval(intervalId);
}
