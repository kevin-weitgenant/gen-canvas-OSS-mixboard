import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { Viewport } from '../types/canvas';
import { isPointInImage } from '../utils/hitTest';
import { useCanvasStore } from '../store/canvasStore';

interface UseCanvasContextMenuOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  viewport: Viewport;
}

/**
 * Handles right-click context menu for canvas images.
 * Shows context menu when right-clicking on an image.
 */
export function useCanvasContextMenu({ canvasRef, viewport }: UseCanvasContextMenuOptions) {
  const setContextMenu = useCanvasStore((state) => state.setContextMenu);
  const contextMenu = useCanvasStore((state) => state.contextMenu);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextMenu = (e: MouseEvent) => {
      const images = useCanvasStore.getState().images;

      // Check if right-clicking on any image (iterate in reverse for z-order)
      let clickedImageId: string | null = null;
      for (let i = images.length - 1; i >= 0; i--) {
        if (isPointInImage(e.pageX, e.pageY, images[i], viewport)) {
          clickedImageId = images[i].id;
          break;
        }
      }

      if (clickedImageId) {
        e.preventDefault();
        setContextMenu({
          imageId: clickedImageId,
        });
      } else {
        // Clear context menu when clicking on empty space
        setContextMenu(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Close context menu on left-click anywhere
      if (e.button === 0) {
        setContextMenu(null);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [viewport, setContextMenu]);

  return { contextMenu };
}
