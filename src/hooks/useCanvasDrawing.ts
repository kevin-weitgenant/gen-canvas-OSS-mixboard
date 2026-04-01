import { useRef } from 'react';
import type { LineSegment, Viewport } from '../types/canvas';
import { toScreenX, toScreenY } from '../utils/coordinates';
import { useCanvasStore } from '../store/canvasStore';

function drawLineOnContext(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function useCanvasDrawing(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  viewport: Viewport
) {
  const isDrawingRef = useRef(false);
  const prevPositionRef = useRef<{ x: number; y: number } | null>(null);

  function startDrawing(x: number, y: number) {
    isDrawingRef.current = true;
    prevPositionRef.current = { x, y };
  }

  function draw(x: number, y: number) {
    if (!isDrawingRef.current || !prevPositionRef.current) return;

    const context = contextRef.current;
    if (!context) return;

    const prev = prevPositionRef.current;

    const drawing: LineSegment = {
      x0: prev.x,
      y0: prev.y,
      x1: x,
      y1: y,
    };

    useCanvasStore.getState().addDrawing(drawing);

    drawLineOnContext(
      context,
      toScreenX(prev.x, viewport),
      toScreenY(prev.y, viewport),
      toScreenX(x, viewport),
      toScreenY(y, viewport)
    );

    prevPositionRef.current = { x, y };
  }

  function stopDrawing() {
    isDrawingRef.current = false;
    prevPositionRef.current = null;
  }

  function redrawAll() {
    const context = contextRef.current;
    if (!context) return;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    const drawings = useCanvasStore.getState().drawings;
    for (const line of drawings) {
      drawLineOnContext(
        context,
        toScreenX(line.x0, viewport),
        toScreenY(line.y0, viewport),
        toScreenX(line.x1, viewport),
        toScreenY(line.y1, viewport)
      );
    }
  }

  return {
    startDrawing,
    draw,
    stopDrawing,
    redrawAll,
  };
}
