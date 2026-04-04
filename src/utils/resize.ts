import type { ResizeHandle, ImageElement } from '../types/canvas';

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

/**
 * Calculate scaled dimensions for multiple images
 * All images scale proportionally from the bounding box anchor point
 * Each image maintains its own aspect ratio
 */
export function calculateMultiImageResize(
  handle: ResizeHandle,
  deltaX: number,
  _deltaY: number,
  images: ImageElement[],
  initialBoundingBox: ImageState
): Array<{ id: string; updates: ImageState }> {
  // Calculate scale factor based on bounding box
  let deltaWidth: number;

  if (handle.includes('right')) {
    deltaWidth = deltaX;
  } else {
    deltaWidth = -deltaX;
  }

  const newWidth = Math.max(MIN_SIZE, initialBoundingBox.width + deltaWidth);
  const scaleFactor = newWidth / initialBoundingBox.width;

  // Calculate anchor point based on handle (point that stays fixed)
  const anchorX = handle.includes('left')
    ? initialBoundingBox.x + initialBoundingBox.width
    : initialBoundingBox.x;

  const anchorY = handle.includes('top')
    ? initialBoundingBox.y + initialBoundingBox.height
    : initialBoundingBox.y;

  return images.map((img) => {
    const aspectRatio = img.width / img.height;
    const newWidth = Math.max(MIN_SIZE, img.width * scaleFactor);
    const newHeight = newWidth / aspectRatio;

    let newX = img.x;
    let newY = img.y;

    if (handle.includes('left')) {
      // Scale from right edge of bounding box
      const distFromAnchor = anchorX - (img.x + img.width);
      newX = anchorX - newWidth - distFromAnchor * scaleFactor;
    } else {
      // Scale from left edge
      const distFromAnchor = img.x - anchorX;
      newX = anchorX + distFromAnchor * scaleFactor;
    }

    if (handle.includes('top')) {
      // Scale from bottom edge of bounding box
      const distFromAnchor = anchorY - (img.y + img.height);
      newY = anchorY - newHeight - distFromAnchor * scaleFactor;
    } else {
      // Scale from top edge
      const distFromAnchor = img.y - anchorY;
      newY = anchorY + distFromAnchor * scaleFactor;
    }

    return {
      id: img.id,
      updates: { x: newX, y: newY, width: newWidth, height: newHeight },
    };
  });
}
