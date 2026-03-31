import { useState, useCallback } from 'react';
import type { Viewport } from '../types/canvas';
import { trueWidth, trueHeight } from '../utils/coordinates';

const INITIAL_VIEWPORT: Viewport = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

export function useCanvasViewport() {
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);

  const pan = useCallback((deltaX: number, deltaY: number, currentScale: number) => {
    setViewport(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX / currentScale,
      offsetY: prev.offsetY + deltaY / currentScale,
    }));
  }, []);

  const zoom = useCallback((
    scaleAmount: number,
    cursorX: number,
    cursorY: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const distX = cursorX / canvasWidth;
    const distY = cursorY / canvasHeight;

    const unitsZoomedX = trueWidth(canvasWidth, viewport.scale) * scaleAmount;
    const unitsZoomedY = trueHeight(canvasHeight, viewport.scale) * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    setViewport(prev => ({
      ...prev,
      scale: prev.scale * (1 + scaleAmount),
      offsetX: prev.offsetX - unitsAddLeft,
      offsetY: prev.offsetY - unitsAddTop,
    }));
  }, [viewport.scale]);

  const reset = useCallback(() => {
    setViewport(INITIAL_VIEWPORT);
  }, []);

  return { viewport, pan, zoom, reset };
}
