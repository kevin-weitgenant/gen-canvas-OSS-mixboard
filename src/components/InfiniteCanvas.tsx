import { useRef, useEffect  } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvasViewport } from '../hooks/useCanvasViewport';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { useCanvasStore } from '../store/canvasStore';
import { toTrueX, toTrueY } from '../utils/coordinates';

export interface InfiniteCanvasRef {
  clear: () => void;
  resetViewport: () => void;
}

export function InfiniteCanvas() {
  const { canvasRef, contextRef } = useCanvas({ backgroundColor: '#fff' });
  const { viewport, pan, zoom } = useCanvasViewport();
  const drawing = useCanvasDrawing(contextRef, viewport);
  const drawings = useCanvasStore((state) => state.drawings);

  const prevPositionRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStateRef = useRef({
    leftDown: false,
    rightDown: false,
  });

  // Redraw when drawings or viewport change (e.g., after clear)
  useEffect(() => {
    drawing.redrawAll();
  }, [drawings, viewport, drawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      if (e.button === 0) {
        mouseStateRef.current.leftDown = true;
        const trueX = toTrueX(e.pageX, viewport);
        const trueY = toTrueY(e.pageY, viewport);
        drawing.startDrawing(trueX, trueY);
      }

      if (e.button === 2) {
        mouseStateRef.current.rightDown = true;
      }

      prevPositionRef.current = { x: e.pageX, y: e.pageY };
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    return () => canvas.removeEventListener('mousedown', handleMouseDown);
  }, [canvasRef, viewport, drawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const prev = prevPositionRef.current;
      if (!prev) return;

      const trueX = toTrueX(e.pageX, viewport);
      const trueY = toTrueY(e.pageY, viewport);

      if (mouseStateRef.current.leftDown) {
        drawing.draw(trueX, trueY);
      }

      if (mouseStateRef.current.rightDown) {
        const deltaX = e.pageX - prev.x;
        const deltaY = e.pageY - prev.y;
        pan(deltaX, deltaY, viewport.scale);
      }

      prevPositionRef.current = { x: e.pageX, y: e.pageY };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [canvasRef, viewport, drawing, pan]);

  useEffect(() => {
    const handleMouseUp = () => {
      mouseStateRef.current.leftDown = false;
      mouseStateRef.current.rightDown = false;
      drawing.stopDrawing();
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [drawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleAmount = -e.deltaY / 500;
      zoom(scaleAmount, e.pageX, e.pageY, canvas.width, canvas.height);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [canvasRef, zoom]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef} className="block touch-none select-none" />
    </div>
  );
}
