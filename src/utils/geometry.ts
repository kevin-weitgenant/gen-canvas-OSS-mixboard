import type { ImageElement, Viewport, ResizeHandle } from '../types/canvas';
import { toScreenX, toScreenY } from './coordinates';

const HANDLE_SIZE = 8;
const SELECTION_COLOR = '#3b82f6';

interface SelectionBox {
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
