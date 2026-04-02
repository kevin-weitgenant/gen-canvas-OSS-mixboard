import type { ImageElement, Viewport, ResizeHandle, BoundingBox, SelectionRectangle } from '../types/canvas';
import { toScreenX, toScreenY } from './coordinates';

const HANDLE_SIZE = 8;
const SELECTION_COLOR = '#3b82f6';

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Get the screen-space bounding box of an image
 */
export function getImageScreenBox(image: ImageElement, viewport: Viewport): SelectionBox {
  return {
    x: toScreenX(image.x, viewport),
    y: toScreenY(image.y, viewport),
    width: image.width * viewport.scale,
    height: image.height * viewport.scale,
  };
}

/**
 * Get the positions of the 4 corner resize handles
 */
export function getResizeHandles(image: ImageElement, viewport: Viewport): Record<ResizeHandle, { x: number; y: number }> {
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
 * Get resize handles for a selection box (in screen coords)
 */
export function getSelectionBoxHandles(box: SelectionBox): Record<ResizeHandle, { x: number; y: number }> {
  const halfHandle = HANDLE_SIZE / 2;

  return {
    'top-left': { x: box.x - halfHandle, y: box.y - halfHandle },
    'top-right': { x: box.x + box.width - halfHandle, y: box.y - halfHandle },
    'bottom-left': { x: box.x - halfHandle, y: box.y + box.height - halfHandle },
    'bottom-right': { x: box.x + box.width - halfHandle, y: box.y + box.height - halfHandle },
  };
}

/**
 * Draw the selection box and resize handles around the selected image
 */
export function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  image: ImageElement,
  viewport: Viewport
): void {
  const box = getImageScreenBox(image, viewport);

  ctx.strokeStyle = SELECTION_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  ctx.fillStyle = '#fff';
  const handles = getResizeHandles(image, viewport);

  for (const pos of Object.values(handles)) {
    ctx.fillRect(pos.x, pos.y, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(pos.x, pos.y, HANDLE_SIZE, HANDLE_SIZE);
  }
}

/**
 * Get the bounding box of multiple images in world coordinates
 */
export function getImagesBoundingBox(images: ImageElement[]): BoundingBox | null {
  if (images.length === 0) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const img of images) {
    minX = Math.min(minX, img.x);
    minY = Math.min(minY, img.y);
    maxX = Math.max(maxX, img.x + img.width);
    maxY = Math.max(maxY, img.y + img.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get the bounding box in screen coordinates for rendering
 */
export function getBoundingBoxScreenBox(
  images: ImageElement[],
  viewport: Viewport
): SelectionBox | null {
  const boundingBox = getImagesBoundingBox(images);
  if (!boundingBox) return null;

  return {
    x: toScreenX(boundingBox.x, viewport),
    y: toScreenY(boundingBox.y, viewport),
    width: boundingBox.width * viewport.scale,
    height: boundingBox.height * viewport.scale,
  };
}

/**
 * Draw the multi-selection bounding box with resize handles
 */
export function drawMultiSelectionBox(
  ctx: CanvasRenderingContext2D,
  images: ImageElement[],
  viewport: Viewport
): void {
  const box = getBoundingBoxScreenBox(images, viewport);
  if (!box) return;

  // Draw bounding rectangle
  ctx.strokeStyle = SELECTION_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  // Draw corner handles
  const handles = getSelectionBoxHandles(box);
  ctx.fillStyle = '#fff';

  for (const pos of Object.values(handles)) {
    ctx.fillRect(pos.x, pos.y, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(pos.x, pos.y, HANDLE_SIZE, HANDLE_SIZE);
  }
}

/**
 * Draw the temporary selection rectangle during drag
 */
export function drawSelectionRectangle(
  ctx: CanvasRenderingContext2D,
  rect: SelectionRectangle
): void {
  const x = Math.min(rect.startX, rect.currentX);
  const y = Math.min(rect.startY, rect.currentY);
  const width = Math.abs(rect.currentX - rect.startX);
  const height = Math.abs(rect.currentY - rect.startY);

  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]); // Dashed line for temporary selection
  ctx.strokeRect(x, y, width, height);
  ctx.setLineDash([]); // Reset

  // Semi-transparent fill
  ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  ctx.fillRect(x, y, width, height);
}
