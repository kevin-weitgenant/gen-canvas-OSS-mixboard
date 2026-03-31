import { useRef, useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvasViewport } from '../hooks/useCanvasViewport';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { toTrueX, toTrueY } from '../utils/coordinates';
import '../styles/canvas.css';

interface InfiniteCanvasProps {
  onClear?: () => void;
  onResetViewport?: () => void;
}

export function InfiniteCanvas({ onClear, onResetViewport }: InfiniteCanvasProps) {
  const { canvasRef, contextRef } = useCanvas({ backgroundColor: '#fff' });
  const { viewport, pan, zoom, reset } = useCanvasViewport();
  const drawing = useCanvasDrawing(contextRef, viewport);

  // Track previous position for delta calculations
  const prevPositionRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStateRef = useRef({
    leftDown: false,
    rightDown: false,
  });

  // Expose clear and reset methods via ref for parent components
  useEffect(() => {
    if (onClear) {
      // Store clear function in a way parent can call it
      (canvasRef.current as any)?.addEventListener('clear', drawing.clear);
    }
  }, [drawing.clear, onClear, canvasRef]);

  useEffect(() => {
    if (onResetViewport) {
      reset();
    }
  }, [onResetViewport, reset]);

  // Mouse down handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      if (e.button === 0) {
        // Left click - draw
        mouseStateRef.current.leftDown = true;
        mouseStateRef.current.rightDown = false;
        const trueX = toTrueX(e.pageX, viewport);
        const trueY = toTrueY(e.pageY, viewport);
        drawing.startDrawing(trueX, trueY);
      }

      if (e.button === 2) {
        // Right click - pan
        mouseStateRef.current.rightDown = true;
        mouseStateRef.current.leftDown = false;
      }

      prevPositionRef.current = { x: e.pageX, y: e.pageY };
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    return () => canvas.removeEventListener('mousedown', handleMouseDown);
  }, [viewport, drawing]);

  // Mouse move handler
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
        drawing.redrawAll();
      }

      prevPositionRef.current = { x: e.pageX, y: e.pageY };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [viewport, drawing, pan]);

  // Mouse up handler
  useEffect(() => {
    const handleMouseUp = () => {
      mouseStateRef.current.leftDown = false;
      mouseStateRef.current.rightDown = false;
      drawing.stopDrawing();
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [drawing]);

  // Wheel handler (zoom)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleAmount = -e.deltaY / 500;
      zoom(scaleAmount, e.pageX, e.pageY, canvas.width, canvas.height);
      drawing.redrawAll();
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [zoom, drawing]);

  // Disable context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className="infinite-canvas" />
    </div>
  );
}
