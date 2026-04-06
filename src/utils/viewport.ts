import type { Viewport } from '../types/canvas';

export function calculateViewportCenter(
  viewport: Viewport,
  imageSize: number
): { x: number; y: number } {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Use correct transformation matching toTrueX/toTrueY from coordinates.ts
  const worldX = centerX / viewport.scale - viewport.offsetX;
  const worldY = centerY / viewport.scale - viewport.offsetY;

  return {
    x: worldX - imageSize / 2,
    y: worldY - imageSize / 2,
  };
}
