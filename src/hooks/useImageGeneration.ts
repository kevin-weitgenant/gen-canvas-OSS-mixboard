import { useCanvasStore } from '../store/canvasStore';
import { createTask, getTaskStatus } from '../services/zImageApi';
import { createPollingTask } from '../services/pollingService';
import { calculateViewportCenter } from '../utils/viewport';
import { generateImageId } from '../utils/id';
import { loadImage } from '../utils/image';
import {
  DEFAULT_IMAGE_SIZE,
  POLLING_INTERVAL,
} from '../constants/imageGeneration';
import type { ImageLoadingState } from '../types/zImage';
import type { ImageSource } from '../types/canvas';

export function useImageGeneration() {
  const { addImage, updateImage, viewport } = useCanvasStore();

  const generateImage = async (prompt: string): Promise<string | null> => {
    try {
      const taskId = await createTask(prompt);
      const imageId = generateImageId();
      const position = calculateViewportCenter(viewport, DEFAULT_IMAGE_SIZE);

      // Add loading placeholder
      const source: ImageSource = {
        type: 'generated',
        prompt,
      };
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
        source,
      });

      // Start polling
      const stopPolling = createPollingTask({
        interval: POLLING_INTERVAL,
        getStatus: () => getTaskStatus(taskId),
        onSuccess: async (resultUrls) => {
          const imageUrl = resultUrls[0];
          // Set downloading state and URL
          updateImage(imageId, {
            src: imageUrl,
            loadingState: 'downloading',
          });
          // Preload image before showing
          try {
            await loadImage(imageUrl);
            updateImage(imageId, {
              isLoading: false,
              loadingState: 'success',
            });
          } catch (error) {
            updateImage(imageId, {
              isLoading: false,
              loadingState: 'failed',
            });
          }
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
