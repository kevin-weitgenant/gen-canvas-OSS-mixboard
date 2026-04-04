import type { Viewport } from '../types/canvas';

export function calculateViewportCenter(
  viewport: Viewport,
  imageSize: number
): { x: number; y: number } {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const worldX = (centerX - viewport.offsetX) / viewport.scale;
  const worldY = (centerY - viewport.offsetY) / viewport.scale;

  return {
    x: worldX - imageSize / 2,
    y: worldY - imageSize / 2,
  };
}
