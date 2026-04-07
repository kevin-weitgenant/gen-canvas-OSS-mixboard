import { useCanvasStore } from '../store/canvasStore';
import { calculateViewportCenter } from '../utils/viewport';
import { generateImageId } from '../utils/id';
import { loadImage } from '../utils/image';
import { sseManager, type WebhookEvent } from '../services/sseConnectionManager';
import { DEFAULT_IMAGE_SIZE } from '../constants/imageGeneration';
import type { ImageSource } from '../types/canvas';
import { createSseSessionApiSseSessionPost } from '../api/generated';
import { getApiKey } from '../components/KeyForm';

export function useImageGeneration() {
  const { addImage, updateImage, viewport } = useCanvasStore();

  const generateImage = async (
    prompt: string,
    aspectRatio: string = '1:1'
  ): Promise<string | null> => {
    // 1. Create image placeholder FIRST - shows skeleton immediately
    const imageId = generateImageId();
    const position = calculateViewportCenter(viewport, DEFAULT_IMAGE_SIZE);

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

    try {
      // 2. Create SSE session via backend
      const sessionResponse = await createSseSessionApiSseSessionPost();
      if (sessionResponse.status !== 200) {
        throw new Error('Failed to create SSE session');
      }
      const { sessionId, webhookUrl, sseUrl } = sessionResponse.data;
      console.log('[ImageGeneration] SSE session created:', { sessionId, sseUrl });

      // 3. Get API key and call Kie.ai directly (NOT via backend)
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('API key is required. Please add your Kie.ai API key.');
      }

      const kieResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'z-image',
          callBackUrl: webhookUrl,
          input: {
            prompt,
            aspect_ratio: aspectRatio,
            nsfw_checker: false
          }
        })
      });

      if (!kieResponse.ok) {
        throw new Error(`Kie.ai API error: ${kieResponse.status}`);
      }

      const kieData = await kieResponse.json();
      if (kieData.code !== 200) {
        throw new Error(`Kie.ai API error: ${kieData.msg}`);
      }

      console.log('[ImageGeneration] Kie.ai task created:', kieData.data.taskId);

      // 4. Listen for webhook via SSE
      sseManager.connect(imageId, sseUrl, {
        onMessage: async (event: WebhookEvent) => {
          console.log('[ImageGeneration] SSE event received:', { imageId, event });
          switch (event.state) {
            case 'waiting':
            case 'queuing':
              console.log('[ImageGeneration] State: waiting/queuing -> creating');
              updateImage(imageId, { loadingState: 'creating' });
              break;

            case 'generating':
              console.log('[ImageGeneration] State: generating -> polling');
              updateImage(imageId, { loadingState: 'polling' });
              break;

            case 'success':
              console.log('[ImageGeneration] State: success');
              handleSuccess(event, imageId);
              break;

            case 'fail':
              console.log('[ImageGeneration] State: fail');
              handleFailure(imageId);
              break;
          }
        },
        onError: () => {
          handleFailure(imageId);
        },
      });

      return imageId;
    } catch (error) {
      console.error('Failed to generate image:', error);
      // Update skeleton to show failed state
      updateImage(imageId, {
        isLoading: false,
        loadingState: 'failed',
      });
      // Re-throw error so caller can handle UI feedback
      throw error;
    }
  };

  const handleSuccess = async (event: WebhookEvent, imageId: string) => {
    console.log('[ImageGeneration] Handling success:', { imageId, event });
    if (event.resultJson) {
      try {
        const result = JSON.parse(event.resultJson);
        const imageUrl = result.resultUrls?.[0];

        if (imageUrl) {
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
            console.error('Failed to load image:', error);
            updateImage(imageId, {
              isLoading: false,
              loadingState: 'failed',
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse resultJson:', error);
        handleFailure(imageId);
      }
    }

    // Disconnect SSE on success
    sseManager.disconnect(imageId);
  };

  const handleFailure = (imageId: string) => {
    console.log('[ImageGeneration] Handling failure:', { imageId });
    updateImage(imageId, {
      isLoading: false,
      loadingState: 'failed',
    });
    sseManager.disconnect(imageId);
  };

  // Cleanup function for component unmount
  const cleanup = (imageId: string) => {
    sseManager.disconnect(imageId);
  };

  // Cleanup all on unmount
  const cleanupAll = () => {
    sseManager.disconnectAll();
  };

  return { generateImage, cleanup, cleanupAll };
}
