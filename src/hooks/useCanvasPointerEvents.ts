import { useRef, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { Viewport } from '../types/canvas';
import { toTrueX, toTrueY } from '../utils/coordinates';

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
  currentTool: 'pen' | 'pan';
  spacePressed: boolean;
}

interface UseCanvasPointerEventsReturn {
  isDragging: boolean;
}

interface MouseState {
  leftDown: boolean;
  prevX: number;
  prevY: number;
  hasPosition: boolean;
}

/**
 * Handles all pointer events for the canvas including mouse and wheel interactions.
 * Manages drawing, panning, and zooming based on current tool and space key state.
 */
export function useCanvasPointerEvents({
  canvasRef,
  viewport,
  drawing,
  pan,
  zoom,
  currentTool,
  spacePressed,
}: UseCanvasPointerEventsOptions): UseCanvasPointerEventsReturn {
  const [isDragging, setIsDragging] = useState(false);

  // Mouse state tracking
  const mouseStateRef = useRef<MouseState>({
    leftDown: false,
    prevX: 0,
    prevY: 0,
    hasPosition: false,
  });

  // Canvas mouse events (mousedown, mousemove, wheel)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      const state = mouseStateRef.current;
      const isPanMode = currentTool === 'pan' || spacePressed;

      if (e.button === 0) {
        state.leftDown = true;

        if (isPanMode) {
          setIsDragging(true);
        } else {
          const trueX = toTrueX(e.pageX, viewport);
          const trueY = toTrueY(e.pageY, viewport);
          drawing.startDrawing(trueX, trueY);
        }
      }

      state.prevX = e.pageX;
      state.prevY = e.pageY;
      state.hasPosition = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = mouseStateRef.current;
      if (!state.hasPosition) return;

      const trueX = toTrueX(e.pageX, viewport);
      const trueY = toTrueY(e.pageY, viewport);
      const isPanMode = currentTool === 'pan' || spacePressed;

      if (state.leftDown && isPanMode) {
        const deltaX = e.pageX - state.prevX;
        const deltaY = e.pageY - state.prevY;
        pan(deltaX, deltaY, viewport.scale);
      } else if (state.leftDown) {
        drawing.draw(trueX, trueY);
      }

      state.prevX = e.pageX;
      state.prevY = e.pageY;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleAmount = -e.deltaY / 500;
      zoom(scaleAmount, e.pageX, e.pageY, canvas.width, canvas.height);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [viewport, drawing, pan, zoom, currentTool, spacePressed]);

  // Window-level mouseup (handles drags that end outside canvas)
  useEffect(() => {
    const handleMouseUp = () => {
      const state = mouseStateRef.current;
      state.leftDown = false;
      drawing.stopDrawing();
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [drawing]);

  return { isDragging };
}
