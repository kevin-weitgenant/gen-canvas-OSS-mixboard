import { useCanvasStore } from '../store/canvasStore';
import { createTask, getTaskStatus } from '../services/zImageApi';
import { createPollingTask } from '../services/pollingService';
import { calculateViewportCenter } from '../utils/viewport';
import { generateImageId } from '../utils/id';
import {
  DEFAULT_IMAGE_SIZE,
  POLLING_INTERVAL,
} from '../constants/imageGeneration';
import type { ImageLoadingState } from '../types/zImage';

export function useImageGeneration() {
  const { addImage, updateImage, viewport } = useCanvasStore();

  const generateImage = async (prompt: string): Promise<string | null> => {
    try {
      const taskId = await createTask(prompt);
      const imageId = generateImageId();
      const position = calculateViewportCenter(viewport, DEFAULT_IMAGE_SIZE);

      // Add loading placeholder
      addImage({
        id: imageId,
        type: 'image',
        src: '',
        x: position.x,
        y: position.y,
        width: DEFAULT_IMAGE_SIZE,
        height: DEFAULT_IMAGE_SIZE,
        isLoading: true,
        loadingState: 'creating',
      });

      // Start polling
      const stopPolling = createPollingTask({
        interval: POLLING_INTERVAL,
        getStatus: () => getTaskStatus(taskId),
        onSuccess: (resultUrls) => {
          updateImage(imageId, {
            src: resultUrls[0],
            isLoading: false,
            loadingState: 'success',
          });
        },
        onError: () => {
          updateImage(imageId, {
            isLoading: false,
            loadingState: 'failed',
          });
        },
        onProgress: (state) => {
          const loadingState: ImageLoadingState =
            state === 'waiting' || state === 'queuing' ? 'creating' : 'polling';
          updateImage(imageId, { loadingState });
        },
      });

      // Store cleanup function on the window for potential external cleanup
      (window as unknown as { _stopPolling?: () => void })._stopPolling = stopPolling;

      return imageId;
    } catch (error) {
      console.error('Failed to generate image:', error);
      return null;
    }
  };

  return { generateImage };
}
