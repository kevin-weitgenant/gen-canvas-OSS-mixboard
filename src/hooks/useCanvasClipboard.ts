import { useCanvasStore } from '../store/canvasStore';
import { calculateOffsetPositions } from '../utils/geometry';

interface UseCanvasClipboardReturn {
  copyImages: (ids: string[]) => void;
  pasteImages: (canvasX: number, canvasY: number) => void;
}

/**
 * Handles clipboard operations for canvas images.
 * Supports copying images to internal clipboard and pasting them at a given position
 * while preserving their relative positions.
 */
export function useCanvasClipboard(): UseCanvasClipboardReturn {
  const copyImages = (ids: string[]) => {
    useCanvasStore.getState().copyImages(ids);
  };

  const pasteImages = (canvasX: number, canvasY: number) => {
    const store = useCanvasStore.getState();
    const { clipboardImages } = store;

    if (clipboardImages.length === 0) return;

    const positions = calculateOffsetPositions(clipboardImages, canvasX, canvasY);
    const newImageIds: string[] = [];

    for (const { image, x, y } of positions) {
      const newImage = {
        ...image,
        id: crypto.randomUUID(),
        x,
        y,
      };
      store.addImage(newImage);
      newImageIds.push(newImage.id);
    }

    store.setSelectedImageIds(newImageIds);
    store.setTool('selection');
  };

  return { copyImages, pasteImages };
}
