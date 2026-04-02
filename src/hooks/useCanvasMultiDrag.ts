import { useRef } from 'react';
import type { ImageElement } from '../types/canvas';
import type { LiveMultiDragState } from '../types/canvas';

interface MultiDragState {
  dragStartX: number;
  dragStartY: number;
  initialImages: Map<string, { x: number; y: number }>;
}

/**
 * Handles multi-image dragging operations.
 * Uses live state during drag for smooth rendering without store updates.
 */
export function useCanvasMultiDrag(scale: number) {
  const dragStateRef = useRef<MultiDragState | null>(null);
  const liveDragStateRef = useRef<LiveMultiDragState | null>(null);

  const startMultiDrag = (images: ImageElement[], screenX: number, screenY: number) => {
    const initialImages = new Map<string, { x: number; y: number }>();
    for (const img of images) {
      initialImages.set(img.id, { x: img.x, y: img.y });
    }

    dragStateRef.current = {
      dragStartX: screenX,
      dragStartY: screenY,
      initialImages,
    };
  };

  const updateMultiDrag = (screenX: number, screenY: number, currentImages: ImageElement[]): boolean => {
    const state = dragStateRef.current;
    if (!state) return false;

    const deltaX = (screenX - state.dragStartX) / scale;
    const deltaY = (screenY - state.dragStartY) / scale;

    const liveImages = new Map<string, ImageElement>();
    for (const img of currentImages) {
      const initial = state.initialImages.get(img.id);
      if (initial) {
        liveImages.set(img.id, {
          ...img,
          x: initial.x + deltaX,
          y: initial.y + deltaY,
        });
      }
    }

    liveDragStateRef.current = { images: liveImages };
    return true;
  };

  const commitMultiDrag = () => {
    const liveState = liveDragStateRef.current;
    if (!liveState) return [];

    const updates: Array<{ id: string; updates: { x: number; y: number } }> = [];

    for (const [id, img] of liveState.images) {
      updates.push({ id, updates: { x: img.x, y: img.y } });
    }

    return updates;
  };

  const cancelMultiDrag = () => {
    dragStateRef.current = null;
    liveDragStateRef.current = null;
  };

  const isActive = () => dragStateRef.current !== null;

  return {
    startMultiDrag,
    updateMultiDrag,
    commitMultiDrag,
    cancelMultiDrag,
    getLiveMultiDragState: () => liveDragStateRef.current,
    isActive,
  };
}
