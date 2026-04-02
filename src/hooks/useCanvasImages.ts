import type { Viewport, ImageElement } from '../types/canvas';
import { toScreenX, toScreenY } from '../utils/coordinates';
import { drawSelectionBox } from '../utils/geometry';
import { loadImage, readFileAsDataURL } from '../utils/image';
import { useCanvasStore } from '../store/canvasStore';

export interface DropHandlers {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export interface LiveResizeState {
  imageId: string;
  image: ImageElement;
}

export function useCanvasImages(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  viewport: Viewport
) {
  function renderAll(liveResizeState: LiveResizeState | null = null) {
    const context = contextRef.current;
    if (!context) return;

    const images = useCanvasStore.getState().images;
    const selectedImageId = useCanvasStore.getState().selectedImageId;

    for (const imageEl of images) {
      // Use live state if available and matches this image
      const toRender = liveResizeState?.imageId === imageEl.id
        ? liveResizeState.image
        : imageEl;

      loadImage(toRender.src).then((img) => {
        const ctx = contextRef.current;
        if (!ctx) return;
        const screenX = toScreenX(toRender.x, viewport);
        const screenY = toScreenY(toRender.y, viewport);
        const screenWidth = toRender.width * viewport.scale;
        const screenHeight = toRender.height * viewport.scale;
        ctx.drawImage(img, screenX, screenY, screenWidth, screenHeight);
      });
    }

    // Draw selection box on top - use live state for selected image if resizing
    if (selectedImageId) {
      let selectedImage = images.find((img) => img.id === selectedImageId);
      // Override with live resize state if available
      if (liveResizeState && liveResizeState.imageId === selectedImageId) {
        selectedImage = liveResizeState.image;
      }
      if (selectedImage) {
        drawSelectionBox(context, selectedImage, viewport);
      }
    }
  }

  function createDropHandlers(): DropHandlers {
    function handleDragOver(e: React.DragEvent) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }

    async function handleDrop(e: React.DragEvent) {
      e.preventDefault();

      const canvas = e.currentTarget as HTMLCanvasElement;
      if (!canvas) return;

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const canvasX = screenX / viewport.scale - viewport.offsetX;
      const canvasY = screenY / viewport.scale - viewport.offsetY;

      for (const file of imageFiles) {
        const dataUrl = await readFileAsDataURL(file);
        const img = await loadImage(dataUrl);

        const imageId = crypto.randomUUID();
        useCanvasStore.getState().addImage({
          id: imageId,
          type: 'image',
          src: dataUrl,
          x: canvasX,
          y: canvasY,
          width: img.width,
          height: img.height,
        });

        useCanvasStore.getState().setSelectedImageId(imageId);
        useCanvasStore.getState().setTool('selection');
      }
    }

    return { onDragOver: handleDragOver, onDrop: handleDrop };
  }

  return {
    renderAll,
    createDropHandlers,
  };
}
