import type { ResizeHandle } from '../types/canvas';

interface ImageState {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_SIZE = 10;

/**
 * Calculate new image dimensions and position after resizing from a corner handle.
 * Maintains aspect ratio proportionally with smooth, linear scaling.
 */
export function calculateResize(
  handle: ResizeHandle,
  deltaX: number,
  _deltaY: number,
  initial: ImageState
): ImageState {
  const aspectRatio = initial.width / initial.height;

  // Determine the primary axis and effective delta based on handle position
  // For handles on the right side, use deltaX directly (positive delta = grow)
  // For handles on the left side, negate deltaX (dragging left/right feels natural)
  // Then convert to width change maintaining aspect ratio
  let deltaWidth: number;

  if (handle.includes('right')) {
    // Right handles: deltaX directly maps to width change
    deltaWidth = deltaX;
  } else {
    // Left handles: negative deltaX (drag left = grow, drag right = shrink)
    deltaWidth = -deltaX;
  }

  const newWidth = Math.max(MIN_SIZE, initial.width + deltaWidth);
  const newHeight = newWidth / aspectRatio;
  const widthDiff = initial.width - newWidth;
  const heightDiff = initial.height - newHeight;

  // Calculate new position based on which corner is being dragged
  const x = handle.includes('left')
    ? initial.x + widthDiff
    : initial.x;

  const y = handle.includes('top')
    ? initial.y + heightDiff
    : initial.y;

  return { x, y, width: newWidth, height: newHeight };
}
