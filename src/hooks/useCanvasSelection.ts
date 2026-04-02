import type { Viewport, ResizeHandle } from '../types/canvas';
import { getResizeHandleAtPoint } from '../utils/hitTest';
import { useSelectedImage } from '../store/canvasStore';

/**
 * Handles image selection state and provides selection-related utilities.
 * Returns the currently selected image and hit testing functions.
 */
export function useCanvasSelection(viewport: Viewport) {
  const selectedImage = useSelectedImage();

  const getHandleAtPoint = (screenX: number, screenY: number): ResizeHandle | null => {
    if (!selectedImage) return null;
    return getResizeHandleAtPoint(screenX, screenY, selectedImage, viewport);
  };

  return {
    selectedImage,
    getHandleAtPoint,
  };
}
