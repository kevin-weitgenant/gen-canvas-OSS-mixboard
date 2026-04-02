import { useRef, useState } from 'react';
import type { Viewport, ResizeHandle, ImageElement } from '../types/canvas';
import { calculateResize } from '../utils/resize';

interface ResizeState {
  activeHandle: ResizeHandle;
  dragStartX: number;
  dragStartY: number;
  initialImageX: number;
  initialImageY: number;
  initialImageWidth: number;
  initialImageHeight: number;
}

export interface LiveResizeState {
  imageId: string;
  image: ImageElement;
}

/**
 * Handles image resizing operations.
 * Manages live resize state for smooth rendering during drag.
 */
export function useCanvasImageResize(viewport: Viewport) {
  const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const liveResizeStateRef = useRef<LiveResizeState | null>(null);

  const startResize = (
    handle: ResizeHandle,
    image: ImageElement,
    screenX: number,
    screenY: number
  ) => {
    resizeStateRef.current = {
      activeHandle: handle,
      dragStartX: screenX,
      dragStartY: screenY,
      initialImageX: image.x,
      initialImageY: image.y,
      initialImageWidth: image.width,
      initialImageHeight: image.height,
    };
  };

  const updateResize = (screenX: number, screenY: number, currentImage: ImageElement): boolean => {
    const state = resizeStateRef.current;
    if (!state) return false;

    const deltaX = (screenX - state.dragStartX) / viewport.scale;
    const deltaY = (screenY - state.dragStartY) / viewport.scale;

    const newSize = calculateResize(
      state.activeHandle,
      deltaX,
      deltaY,
      {
        x: state.initialImageX,
        y: state.initialImageY,
        width: state.initialImageWidth,
        height: state.initialImageHeight,
      }
    );

    liveResizeStateRef.current = {
      imageId: currentImage.id,
      image: { ...currentImage, ...newSize },
    };

    return true;
  };

  const commitResize = (imageId: string) => {
    const liveState = liveResizeStateRef.current;
    if (liveState && liveState.imageId === imageId) {
      return { x: liveState.image.x, y: liveState.image.y, width: liveState.image.width, height: liveState.image.height };
    }
    return null;
  };

  const cancelResize = () => {
    resizeStateRef.current = null;
    liveResizeStateRef.current = null;
  };

  const isActive = () => resizeStateRef.current !== null;

  return {
    hoveredHandle,
    setHoveredHandle,
    startResize,
    updateResize,
    commitResize,
    cancelResize,
    getLiveResizeState: () => liveResizeStateRef.current,
    isActive,
  };
}
