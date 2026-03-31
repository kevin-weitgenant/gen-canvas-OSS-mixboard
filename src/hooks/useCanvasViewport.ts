import { useCallback } from 'react';
import type { Viewport } from '../types/canvas';
import { trueWidth, trueHeight } from '../utils/coordinates';
import { useCanvasStore } from '../store/canvasStore';

const INITIAL_VIEWPORT: Viewport = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

export function useCanvasViewport() {
  const viewport = useCanvasStore((state) => state.viewport);
  const setViewport = useCanvasStore((state) => state.setViewport);

  const pan = useCallback((deltaX: number, deltaY: number, currentScale: number) => {
    const current = useCanvasStore.getState().viewport;
    setViewport({
      ...current,
      offsetX: current.offsetX + deltaX / currentScale,
      offsetY: current.offsetY + deltaY / currentScale,
    });
  }, [setViewport]);

  const zoom = useCallback((
    scaleAmount: number,
    cursorX: number,
    cursorY: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const current = useCanvasStore.getState().viewport;

    const distX = cursorX / canvasWidth;
    const distY = cursorY / canvasHeight;

    const unitsZoomedX = trueWidth(canvasWidth, current.scale) * scaleAmount;
    const unitsZoomedY = trueHeight(canvasHeight, current.scale) * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    setViewport({
      ...current,
      scale: current.scale * (1 + scaleAmount),
      offsetX: current.offsetX - unitsAddLeft,
      offsetY: current.offsetY - unitsAddTop,
    });
  }, [setViewport]);

  const reset = useCallback(() => {
    setViewport(INITIAL_VIEWPORT);
  }, [setViewport]);

  return { viewport, pan, zoom, reset };
}
