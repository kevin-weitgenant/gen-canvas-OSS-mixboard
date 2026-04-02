import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Viewport, ImageElement } from '../types/canvas';
import { toTrueX, toTrueY } from '../utils/coordinates';
import { isPointInImage } from '../utils/hitTest';
import { useCanvasStore, useSelectedImage } from '../store/canvasStore';
import { useCanvasSelection } from './useCanvasSelection';
import { useCanvasImageResize } from './useCanvasImageResize';
import { useCanvasImageDrag } from './useCanvasImageDrag';

interface DrawingCallbacks {
  startDrawing: (x: number, y: number) => void;
  draw: (x: number, y: number) => void;
  stopDrawing: () => void;
}

interface PanCallbacks {
  pan: (deltaX: number, deltaY: number, scale: number) => void;
  zoom: (scaleAmount: number, centerX: number, centerY: number, canvasWidth: number, canvasHeight: number) => void;
}

interface UseCanvasPointerEventsOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  viewport: Viewport;
  drawing: DrawingCallbacks;
  pan: PanCallbacks['pan'];
  zoom: PanCallbacks['zoom'];
  currentTool: 'pen' | 'pan' | 'selection';
  spacePressed: boolean;
  onRender?: () => void;
}

interface UseCanvasPointerEventsReturn {
  isDragging: boolean;
  hoveredHandle: ReturnType<typeof useCanvasImageResize>['hoveredHandle'];
  getLiveResizeState: () => import('./useCanvasImageResize').LiveResizeState | null;
  getLiveDragState: () => import('./useCanvasImageDrag').LiveDragState | null;
}

interface MouseState {
  leftDown: boolean;
  prevX: number;
  prevY: number;
  hasPosition: boolean;
}

/**
 * Handles pointer events for the canvas.
 * Coordinates between different tool modes (pan, draw, selection).
 */
export function useCanvasPointerEvents({
  canvasRef,
  viewport,
  drawing,
  pan,
  zoom,
  currentTool,
  spacePressed,
  onRender,
}: UseCanvasPointerEventsOptions): UseCanvasPointerEventsReturn {
  const [isDragging, setIsDragging] = useState(false);

  const mouseStateRef = useRef<MouseState>({
    leftDown: false,
    prevX: 0,
    prevY: 0,
    hasPosition: false,
  });

  const selection = useCanvasSelection(viewport);
  const resize = useCanvasImageResize(viewport);
  const drag = useCanvasImageDrag(viewport.scale);
  const selectedImage = useSelectedImage();

  const isPanMode = () => currentTool === 'pan' || spacePressed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (e.target !== canvas) return;
      e.preventDefault();

      const state = mouseStateRef.current;
      state.leftDown = true;
      state.prevX = e.pageX;
      state.prevY = e.pageY;
      state.hasPosition = true;

      if (isPanMode()) {
        setIsDragging(true);
      } else if (currentTool === 'selection') {
        const handle = selection.getHandleAtPoint(e.pageX, e.pageY);
        if (handle && selectedImage) {
          resize.startResize(handle, selectedImage, e.pageX, e.pageY);
          setIsDragging(true);
          return;
        }

        const images = useCanvasStore.getState().images;
        let clickedImage: ImageElement | null = null;
        for (let i = images.length - 1; i >= 0; i--) {
          if (isPointInImage(e.pageX, e.pageY, images[i], viewport)) {
            clickedImage = images[i];
            break;
          }
        }

        if (clickedImage) {
          useCanvasStore.getState().setSelectedImageId(clickedImage.id);
          drag.startDrag(clickedImage, e.pageX, e.pageY);
          setIsDragging(true);
        } else {
          useCanvasStore.getState().setSelectedImageId(null);
        }
      } else {
        const trueX = toTrueX(e.pageX, viewport);
        const trueY = toTrueY(e.pageY, viewport);
        drawing.startDrawing(trueX, trueY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = mouseStateRef.current;
      if (!state.hasPosition) return;

      const screenX = e.pageX;
      const screenY = e.pageY;

      if (state.leftDown && isPanMode()) {
        const deltaX = screenX - state.prevX;
        const deltaY = screenY - state.prevY;
        pan(deltaX, deltaY, viewport.scale);
      } else if (state.leftDown && currentTool === 'selection') {
        if (resize.isActive()) {
          if (selectedImage && resize.updateResize(screenX, screenY, selectedImage)) {
            onRender?.();
          }
        } else if (drag.isActive()) {
          if (selectedImage && drag.updateDrag(screenX, screenY, selectedImage)) {
            onRender?.();
          }
        }
      } else if (state.leftDown) {
        const trueX = toTrueX(screenX, viewport);
        const trueY = toTrueY(screenY, viewport);
        drawing.draw(trueX, trueY);
      } else if (currentTool === 'selection') {
        const handle = selection.getHandleAtPoint(screenX, screenY);
        resize.setHoveredHandle(handle);
      }

      state.prevX = screenX;
      state.prevY = screenY;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleAmount = -e.deltaY / 500;
      zoom(scaleAmount, e.pageX, e.pageY, canvas.width, canvas.height);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [viewport, drawing, pan, zoom, currentTool, spacePressed, selection, resize, drag, selectedImage, onRender]);

  useEffect(() => {
    const handleMouseUp = () => {
      mouseStateRef.current.leftDown = false;
      drawing.stopDrawing();

      if (resize.isActive() && selectedImage) {
        const sizeUpdate = resize.commitResize(selectedImage.id);
        if (sizeUpdate) {
          useCanvasStore.getState().updateImage(selectedImage.id, sizeUpdate);
        }
      }

      if (drag.isActive() && selectedImage) {
        const posUpdate = drag.commitDrag(selectedImage.id);
        if (posUpdate) {
          useCanvasStore.getState().updateImage(selectedImage.id, posUpdate);
        }
      }

      resize.cancelResize();
      drag.cancelDrag();
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [drawing, resize, drag, selectedImage]);

  return {
    isDragging,
    hoveredHandle: resize.hoveredHandle,
    getLiveResizeState: resize.getLiveResizeState,
    getLiveDragState: drag.getLiveDragState,
  };
}
