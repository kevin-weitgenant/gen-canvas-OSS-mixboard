import { useRef, useCallback } from 'react';
import type { LineSegment, DrawingTool, Viewport } from '../types/canvas';
import { toScreenX, toScreenY } from '../utils/coordinates';

function drawLineOnContext(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  lineWidth: number
) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function useCanvasDrawing(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  viewport: Viewport
) {
  const drawingsRef = useRef<LineSegment[]>([]);
  const isDrawingRef = useRef(false);
  const prevPositionRef = useRef<{ x: number; y: number } | null>(null);
  const currentToolRef = useRef<DrawingTool>('pen');
  const currentColorRef = useRef('#000');
  const currentLineWidthRef = useRef(2);

  const startDrawing = useCallback((x: number, y: number) => {
    isDrawingRef.current = true;
    prevPositionRef.current = { x, y };
  }, []);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawingRef.current || !prevPositionRef.current) return;

    const context = contextRef.current;
    if (!context) return;

    const prev = prevPositionRef.current;

    // Store line in "true" coordinates (world space)
    drawingsRef.current.push({
      x0: prev.x,
      y0: prev.y,
      x1: x,
      y1: y,
    });

    // Draw in screen coordinates
    drawLineOnContext(
      context,
      toScreenX(prev.x, viewport, window.innerWidth),
      toScreenY(prev.y, viewport, window.innerHeight),
      toScreenX(x, viewport, window.innerWidth),
      toScreenY(y, viewport, window.innerHeight),
      currentColorRef.current,
      currentLineWidthRef.current
    );

    prevPositionRef.current = { x, y };
  }, [contextRef, viewport]);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    prevPositionRef.current = null;
  }, []);

  const redrawAll = useCallback(() => {
    const context = contextRef.current;
    if (!context) return;

    // Clear canvas
    context.fillStyle = '#fff';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Redraw all lines
    for (const line of drawingsRef.current) {
      drawLineOnContext(
        context,
        toScreenX(line.x0, viewport, window.innerWidth),
        toScreenY(line.y0, viewport, window.innerHeight),
        toScreenX(line.x1, viewport, window.innerWidth),
        toScreenY(line.y1, viewport, window.innerHeight),
        '#000',
        2
      );
    }
  }, [contextRef, viewport]);

  const setTool = useCallback((tool: DrawingTool) => {
    currentToolRef.current = tool;
  }, []);

  const setColor = useCallback((color: string) => {
    currentColorRef.current = color;
  }, []);

  const setLineWidth = useCallback((width: number) => {
    currentLineWidthRef.current = width;
  }, []);

  const clear = useCallback(() => {
    drawingsRef.current = [];
    redrawAll();
  }, [redrawAll]);

  return {
    drawings: drawingsRef.current,
    isDrawing: isDrawingRef.current,
    startDrawing,
    draw,
    stopDrawing,
    redrawAll,
    setTool,
    setColor,
    setLineWidth,
    clear,
  };
}
