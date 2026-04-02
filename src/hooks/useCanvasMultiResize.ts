import { useRef } from 'react';
import type { ResizeHandle, ImageElement } from '../types/canvas';
import { calculateMultiImageResize } from '../utils/resize';
import { getImagesBoundingBox } from '../utils/geometry';
import type { LiveMultiResizeState } from '../types/canvas';

interface ImageState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MultiResizeState {
  activeHandle: ResizeHandle;
  dragStartX: number;
  dragStartY: number;
  initialBoundingBox: ImageState;
  initialImages: ImageElement[];
}

/**
 * Handles multi-image resizing operations.
 * Manages live resize state for smooth rendering during drag.
 */
export function useCanvasMultiResize(scale: number) {
  const resizeStateRef = useRef<MultiResizeState | null>(null);
  const liveResizeStateRef = useRef<LiveMultiResizeState | null>(null);

  const startMultiResize = (
    handle: ResizeHandle,
    images: ImageElement[],
    screenX: number,
    screenY: number
  ) => {
    const boundingBox = getImagesBoundingBox(images);
    if (!boundingBox) return;

    resizeStateRef.current = {
      activeHandle: handle,
      dragStartX: screenX,
      dragStartY: screenY,
      initialBoundingBox: boundingBox,
      initialImages: [...images],
    };
  };

  const updateMultiResize = (screenX: number, screenY: number): boolean => {
    const state = resizeStateRef.current;
    if (!state) return false;

    const deltaX = (screenX - state.dragStartX) / scale;
    const deltaY = (screenY - state.dragStartY) / scale;

    const updates = calculateMultiImageResize(
      state.activeHandle,
      deltaX,
      deltaY,
      state.initialImages,
      state.initialBoundingBox
    );

    const liveImages = new Map<string, ImageElement>();
    for (const { id, updates: imgUpdates } of updates) {
      const original = state.initialImages.find((img) => img.id === id);
      if (original) {
        liveImages.set(id, { ...original, ...imgUpdates });
      }
    }

    liveResizeStateRef.current = { images: liveImages };
    return true;
  };

  const commitMultiResize = () => {
    const liveState = liveResizeStateRef.current;
    if (!liveState) return [];

    const updates: Array<{ id: string; updates: { x: number; y: number; width: number; height: number } }> = [];

    for (const [id, img] of liveState.images) {
      updates.push({ id, updates: { x: img.x, y: img.y, width: img.width, height: img.height } });
    }

    return updates;
  };

  const cancelMultiResize = () => {
    resizeStateRef.current = null;
    liveResizeStateRef.current = null;
  };

  const isActive = () => resizeStateRef.current !== null;

  return {
    startMultiResize,
    updateMultiResize,
    commitMultiResize,
    cancelMultiResize,
    getLiveMultiResizeState: () => liveResizeStateRef.current,
    isActive,
  };
}
