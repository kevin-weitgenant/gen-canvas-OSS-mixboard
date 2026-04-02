import type { Viewport, ImageElement, SelectionRectangle, LiveMultiDragState, LiveMultiResizeState } from '../types/canvas';
import { toScreenX, toScreenY } from '../utils/coordinates';
import { drawSelectionBox, drawMultiSelectionBox, drawSelectionRectangle } from '../utils/geometry';
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

function useCanvasImages(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  viewport: Viewport
) {
  async function renderAll(
    liveResizeState: LiveResizeState | null = null,
    liveDragState: LiveResizeState | null = null,
    liveMultiResizeState: LiveMultiResizeState | null = null,
    liveMultiDragState: LiveMultiDragState | null = null,
    selectionRect: SelectionRectangle | null = null
  ) {
    const context = contextRef.current;
    if (!context) return;

    const images = useCanvasStore.getState().images;
    const selectedIds = useCanvasStore.getState().selectedImageIds;

    // Clear canvas before drawing
    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Merge all live states into a single map
    const liveStates = new Map<string, ImageElement>();

    // Single resize state
    if (liveResizeState) {
      liveStates.set(liveResizeState.imageId, liveResizeState.image);
    }

    // Single drag state
    if (liveDragState) {
      liveStates.set(liveDragState.imageId, liveDragState.image);
    }

    // Multi-resize state
    if (liveMultiResizeState) {
      for (const [id, img] of liveMultiResizeState.images) {
        liveStates.set(id, img);
      }
    }

    // Multi-drag state
    if (liveMultiDragState) {
      for (const [id, img] of liveMultiDragState.images) {
        liveStates.set(id, img);
      }
    }

    // Load and draw all images synchronously in order
    const drawPromises = images.map((imageEl) => {
      // Use live state if available for this image
      const toRender = liveStates.get(imageEl.id) ?? imageEl;

      return loadImage(toRender.src).then((img) => {
        const ctx = contextRef.current;
        if (!ctx) return;
        const screenX = toScreenX(toRender.x, viewport);
        const screenY = toScreenY(toRender.y, viewport);
        const screenWidth = toRender.width * viewport.scale;
        const screenHeight = toRender.height * viewport.scale;
        ctx.drawImage(img, screenX, screenY, screenWidth, screenHeight);
      });
    });

    // Wait for ALL images to finish drawing before selection box
    await Promise.all(drawPromises);

    // Draw selection rectangle if active
    if (selectionRect?.isActive) {
      drawSelectionRectangle(context, selectionRect);
    }

    // Draw selection box(es)
    if (selectedIds.length === 1) {
      // Single selection - use existing
      const selectedImage = images.find((img) => img.id === selectedIds[0]);
      const liveImage = liveStates.get(selectedIds[0]);
      if (selectedImage) {
        drawSelectionBox(context, liveImage ?? selectedImage, viewport);
      }
    } else if (selectedIds.length > 1) {
      // Multi-selection - draw bounding box
      const selectedImages = images
        .filter((img) => selectedIds.includes(img.id))
        .map((img) => liveStates.get(img.id) ?? img);
      drawMultiSelectionBox(context, selectedImages, viewport);
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

        useCanvasStore.getState().setSelectedImageIds([imageId]);
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

export { useCanvasImages };
