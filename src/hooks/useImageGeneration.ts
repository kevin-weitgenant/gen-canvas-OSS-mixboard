import { useCallback, useRef } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { createTask, getTaskStatus } from '../services/zImageApi';
import type { ImageLoadingState } from '../types/zImage';

const POLLING_INTERVAL = 1000; // 1 second
const GENERATION_SIZE = 512;

interface PendingTask {
  imageId: string;
  taskId: string;
  intervalId: number;
}

export function useImageGeneration() {
  const { addImage, updateImage, viewport } = useCanvasStore();
  const pendingTasksRef = useRef<Map<string, PendingTask>>(new Map());

  const calculateCenterPosition = useCallback(() => {
    // Calculate viewport center: convert screen center to world coordinates
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const worldX = (centerX - viewport.offsetX) / viewport.scale;
    const worldY = (centerY - viewport.offsetY) / viewport.scale;

    // Position so image is centered at that point
    return {
      x: worldX - GENERATION_SIZE / 2,
      y: worldY - GENERATION_SIZE / 2,
    };
  }, [viewport]);

  const startPolling = useCallback((imageId: string, taskId: string) => {
    const intervalId = window.setInterval(async () => {
      try {
        const { state, resultUrls } = await getTaskStatus(taskId);

        if (state === 'success' && resultUrls && resultUrls.length > 0) {
          // Success - update image with actual URL
          updateImage(imageId, {
            src: resultUrls[0],
            isLoading: false,
            loadingState: 'success',
          });

          // Clear polling
          const pending = pendingTasksRef.current.get(imageId);
          if (pending) {
            clearInterval(pending.intervalId);
            pendingTasksRef.current.delete(imageId);
          }
        } else if (state === 'fail') {
          // Failure - remove the loading image
          const pending = pendingTasksRef.current.get(imageId);
          if (pending) {
            clearInterval(pending.intervalId);
            pendingTasksRef.current.delete(imageId);
          }

          // Update to show failed state (could show error UI)
          updateImage(imageId, {
            isLoading: false,
            loadingState: 'failed',
          });
        } else {
          // Still processing - update state
          const loadingState: ImageLoadingState =
            state === 'waiting' || state === 'queuing' ? 'creating' : 'polling';
          updateImage(imageId, { loadingState });
        }
      } catch (error) {
        console.error('Polling error:', error);
        // On error, stop polling and mark as failed
        const pending = pendingTasksRef.current.get(imageId);
        if (pending) {
          clearInterval(pending.intervalId);
          pendingTasksRef.current.delete(imageId);
        }
        updateImage(imageId, {
          isLoading: false,
          loadingState: 'failed',
        });
      }
    }, POLLING_INTERVAL);

    pendingTasksRef.current.set(imageId, { imageId, taskId, intervalId });
  }, [updateImage]);

  const generateImage = useCallback(async (prompt: string): Promise<string | null> => {
    try {
      const taskId = await createTask(prompt);

      const { x, y } = calculateCenterPosition();

      const imageId = `img-${Date.now()}-${Math.random()}`;

      // Add loading placeholder image
      addImage({
        id: imageId,
        type: 'image',
        src: '', // Empty src while loading
        x,
        y,
        width: GENERATION_SIZE,
        height: GENERATION_SIZE,
        isLoading: true,
        loadingState: 'creating',
      });

      // Start polling for the result
      startPolling(imageId, taskId);

      return imageId;
    } catch (error) {
      console.error('Failed to generate image:', error);
      return null;
    }
  }, [addImage, calculateCenterPosition, startPolling]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    pendingTasksRef.current.forEach((task) => {
      clearInterval(task.intervalId);
    });
    pendingTasksRef.current.clear();
  }, []);

  return { generateImage, cleanup };
}
