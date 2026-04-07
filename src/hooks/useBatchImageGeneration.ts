import { useCallback } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { calculateGridPositions } from '../utils/viewport';
import { generateImageId } from '../utils/id';
import { loadImage } from '../utils/image';
import { sseManager, type WebhookEvent } from '../services/sseConnectionManager';
import { DEFAULT_IMAGE_SIZE } from '../constants/imageGeneration';
import type { ImageSource } from '../types/canvas';
import { generateImageApiGeneratePost } from '../api/generated';
import type { GenerateRequest } from '../api/models';

export interface PromptConfig {
  prompt: string;
  aspectRatio?: string;
}

export function useBatchImageGeneration() {
  const { addImage, updateImage, viewport } = useCanvasStore();

  const handleSuccess = useCallback(async (event: WebhookEvent, imageId: string) => {
    if (event.resultJson) {
      try {
        const result = JSON.parse(event.resultJson);
        const imageUrl = result.resultUrls?.[0];

        if (imageUrl) {
          updateImage(imageId, {
            src: imageUrl,
            loadingState: 'downloading',
          });

          try {
            await loadImage(imageUrl);
            updateImage(imageId, {
              isLoading: false,
              loadingState: 'success',
            });
          } catch {
            updateImage(imageId, {
              isLoading: false,
              loadingState: 'failed',
            });
          }
        }
      } catch {
        updateImage(imageId, {
          isLoading: false,
          loadingState: 'failed',
        });
        sseManager.disconnect(imageId);
        return;
      }
    }

    sseManager.disconnect(imageId);
  }, [updateImage]);

  const handleFailure = useCallback((imageId: string) => {
    updateImage(imageId, {
      isLoading: false,
      loadingState: 'failed',
    });
    sseManager.disconnect(imageId);
  }, [updateImage]);

  const generateBatchImages = useCallback(
    async (configs: PromptConfig[]): Promise<string[]> => {
      if (configs.length === 0) return [];

      // Calculate grid positions for all images
      const positions = calculateGridPositions(
        viewport,
        DEFAULT_IMAGE_SIZE,
        configs.length
      );

      const imageIds: string[] = [];

      // Create all skeleton placeholders immediately
      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        const imageId = generateImageId();
        const position = positions[i];

        const source: ImageSource = {
          type: 'generated',
          prompt: config.prompt,
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

        imageIds.push(imageId);
      }

      // Initiate all generation requests in parallel
      const generationPromises = configs.map(async (config, index) => {
        const imageId = imageIds[index];

        try {
          const response = await generateImageApiGeneratePost({
            prompt: config.prompt,
            aspect_ratio: config.aspectRatio || '1:1',
          } satisfies GenerateRequest);

          if (response.status !== 200) {
            throw new Error('Failed to generate image');
          }

          const { sseUrl } = response.data;

          // Set up SSE connection for this image
          sseManager.connect(imageId, sseUrl, {
            onMessage: async (event: WebhookEvent) => {
              switch (event.state) {
                case 'waiting':
                case 'queuing':
                  updateImage(imageId, { loadingState: 'creating' });
                  break;

                case 'generating':
                  updateImage(imageId, { loadingState: 'polling' });
                  break;

                case 'success':
                  handleSuccess(event, imageId);
                  break;

                case 'fail':
                  handleFailure(imageId);
                  break;
              }
            },
            onError: () => {
              handleFailure(imageId);
            },
          });

          return { success: true, imageId };
        } catch (error) {
          console.error(`Failed to generate image for prompt "${config.prompt}":`, error);
          updateImage(imageId, {
            isLoading: false,
            loadingState: 'failed',
          });
          return { success: false, imageId };
        }
      });

      // Wait for all requests to initiate (not for completion)
      await Promise.all(generationPromises);

      return imageIds;
    },
    [addImage, updateImage, viewport, handleSuccess, handleFailure]
  );

  return { generateBatchImages };
}
