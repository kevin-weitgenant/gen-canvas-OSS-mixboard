import type { Viewport } from '../types/canvas';

export function toScreenX(xTrue: number, viewport: Viewport, canvasWidth: number): number {
  return (xTrue + viewport.offsetX) * viewport.scale;
}

export function toScreenY(yTrue: number, viewport: Viewport, canvasHeight: number): number {
  return (yTrue + viewport.offsetY) * viewport.scale;
}

export function toTrueX(xScreen: number, viewport: Viewport): number {
  return (xScreen / viewport.scale) - viewport.offsetX;
}

export function toTrueY(yScreen: number, viewport: Viewport): number {
  return (yScreen / viewport.scale) - viewport.offsetY;
}

export function trueWidth(canvasWidth: number, scale: number): number {
  return canvasWidth / scale;
}

export function trueHeight(canvasHeight: number, scale: number): number {
  return canvasHeight / scale;
}
