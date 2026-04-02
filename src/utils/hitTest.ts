import type { ImageElement, Viewport, ResizeHandle } from '../types/canvas';
import { getImageScreenBox } from './geometry';

const HANDLE_SIZE = 8;

/**
 * Check if a point (in screen coordinates) is inside an image
 */
export function isPointInImage(
  screenX: number,
  screenY: number,
  image: ImageElement,
  viewport: Viewport
): boolean {
  const box = getImageScreenBox(image, viewport);
  return (
    screenX >= box.x &&
    screenX <= box.x + box.width &&
    screenY >= box.y &&
    screenY <= box.y + box.height
  );
}

/**
 * Get the positions of the 4 corner resize handles
 */
function getResizeHandles(
  image: ImageElement,
  viewport: Viewport
): Record<ResizeHandle, { x: number; y: number }> {
  const box = getImageScreenBox(image, viewport);
  const halfHandle = HANDLE_SIZE / 2;

  return {
    'top-left': { x: box.x - halfHandle, y: box.y - halfHandle },
    'top-right': { x: box.x + box.width - halfHandle, y: box.y - halfHandle },
    'bottom-left': { x: box.x - halfHandle, y: box.y + box.height - halfHandle },
    'bottom-right': { x: box.x + box.width - halfHandle, y: box.y + box.height - halfHandle },
  };
}

/**
 * Check if a point (in screen coordinates) is on a resize handle
 */
export function getResizeHandleAtPoint(
  screenX: number,
  screenY: number,
  image: ImageElement,
  viewport: Viewport
): ResizeHandle | null {
  const handles = getResizeHandles(image, viewport);

  for (const [handle, pos] of Object.entries(handles)) {
    if (
      screenX >= pos.x &&
      screenX <= pos.x + HANDLE_SIZE &&
      screenY >= pos.y &&
      screenY <= pos.y + HANDLE_SIZE
    ) {
      return handle as ResizeHandle;
    }
  }

  return null;
}
