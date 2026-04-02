import type { ImageElement, Viewport, ResizeHandle } from '../types/canvas';
import { getImageScreenBox, getResizeHandles } from './geometry';

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
