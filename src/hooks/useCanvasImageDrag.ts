import { useRef } from 'react';
import type { ImageElement } from '../types/canvas';

interface DragState {
  dragStartX: number;
  dragStartY: number;
  initialImageX: number;
  initialImageY: number;
}

export interface LiveDragState {
  imageId: string;
  image: ImageElement;
}

/**
 * Handles image dragging operations.
 * Uses live state during drag for smooth rendering without store updates.
 */
export function useCanvasImageDrag(scale: number) {
  const dragStateRef = useRef<DragState | null>(null);
  const liveDragStateRef = useRef<LiveDragState | null>(null);

  const startDrag = (image: ImageElement, screenX: number, screenY: number) => {
    dragStateRef.current = {
      dragStartX: screenX,
      dragStartY: screenY,
      initialImageX: image.x,
      initialImageY: image.y,
    };
  };

  const updateDrag = (screenX: number, screenY: number, currentImage: ImageElement): boolean => {
    const state = dragStateRef.current;
    if (!state) return false;

    const deltaX = (screenX - state.dragStartX) / scale;
    const deltaY = (screenY - state.dragStartY) / scale;

    liveDragStateRef.current = {
      imageId: currentImage.id,
      image: { ...currentImage, x: state.initialImageX + deltaX, y: state.initialImageY + deltaY },
    };

    return true;
  };

  const commitDrag = (imageId: string) => {
    const liveState = liveDragStateRef.current;
    if (liveState && liveState.imageId === imageId) {
      return { x: liveState.image.x, y: liveState.image.y };
    }
    return null;
  };

  const cancelDrag = () => {
    dragStateRef.current = null;
    liveDragStateRef.current = null;
  };

  const isActive = () => dragStateRef.current !== null;

  return {
    startDrag,
    updateDrag,
    commitDrag,
    cancelDrag,
    getLiveDragState: () => liveDragStateRef.current,
    isActive,
  };
}
