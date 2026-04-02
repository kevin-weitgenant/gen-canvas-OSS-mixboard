import type { ImageElement, Viewport, ResizeHandle } from '../types/canvas';
import { getImageScreenBox, getResizeHandles, type SelectionBox, getSelectionBoxHandles } from './geometry';

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

/**
 * Check if an image intersects with a rectangle in screen coordinates
 * Returns true if there's ANY overlap (partial inclusion)
 */
export function doesImageIntersectRect(
  screenRect: { x: number; y: number; width: number; height: number },
  image: ImageElement,
  viewport: Viewport
): boolean {
  const imgBox = getImageScreenBox(image, viewport);

  // AABB intersection test
  return !(
    imgBox.x > screenRect.x + screenRect.width ||
    imgBox.x + imgBox.width < screenRect.x ||
    imgBox.y > screenRect.y + screenRect.height ||
    imgBox.y + imgBox.height < screenRect.y
  );
}

/**
 * Check if a point is on a bounding box resize handle
 */
export function getBoundingBoxHandleAtPoint(
  screenX: number,
  screenY: number,
  boundingBox: SelectionBox
): ResizeHandle | null {
  const handles = getSelectionBoxHandles(boundingBox);

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

/**
 * Check if a point is inside a bounding box
 */
export function isPointInBoundingBox(
  screenX: number,
  screenY: number,
  boundingBox: SelectionBox
): boolean {
  return (
    screenX >= boundingBox.x &&
    screenX <= boundingBox.x + boundingBox.width &&
    screenY >= boundingBox.y &&
    screenY <= boundingBox.y + boundingBox.height
  );
}
