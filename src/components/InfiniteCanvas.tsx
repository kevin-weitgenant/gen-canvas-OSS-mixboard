import { useRef, useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvasViewport } from '../hooks/useCanvasViewport';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { useCanvasStore } from '../store/canvasStore';
import { toTrueX, toTrueY } from '../utils/coordinates';

export function InfiniteCanvas() {
  const { canvasRef, contextRef, resizeCanvas } = useCanvas({ backgroundColor: '#fff' });
  const { viewport, pan, zoom } = useCanvasViewport();
  const drawing = useCanvasDrawing(contextRef, viewport);
  const drawings = useCanvasStore((state) => state.drawings);

  // Consolidated mouse state: button states and previous position in one ref
  const mouseStateRef = useRef({
    leftDown: false,
    rightDown: false,
    prevX: 0,
    prevY: 0,
    hasPosition: false,
  });

  // Redraw when drawings change
  useEffect(() => {
    drawing.redrawAll();
  }, [drawings, drawing]);

  // Handle window resize: resize canvas and redraw content
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
      drawing.redrawAll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas, drawing.redrawAll]);

  // Combined canvas event handlers (mousedown, mousemove, wheel)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();

      const state = mouseStateRef.current;

      if (e.button === 0) {
        state.leftDown = true;
        const trueX = toTrueX(e.pageX, viewport);
        const trueY = toTrueY(e.pageY, viewport);
        drawing.startDrawing(trueX, trueY);
      } else if (e.button === 2) {
        state.rightDown = true;
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

      if (state.leftDown) {
        drawing.draw(trueX, trueY);
      }

      if (state.rightDown) {
        const deltaX = e.pageX - state.prevX;
        const deltaY = e.pageY - state.prevY;
        pan(deltaX, deltaY, viewport.scale);
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
  }, [viewport, drawing, pan, zoom]);

  // Window-level mouseup (handles drags that end outside canvas)
  useEffect(() => {
    const handleMouseUp = () => {
      const state = mouseStateRef.current;
      state.leftDown = false;
      state.rightDown = false;
      drawing.stopDrawing();
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [drawing]);

  // Prevent context menu on right-click
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
