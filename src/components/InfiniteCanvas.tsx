import { useRef, useEffect, useState } from 'react';
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

  // Track if space key is pressed
  const spacePressedRef = useRef(false);

  // Cursor state for visual feedback
  const [cursor, setCursor] = useState<'default' | 'grab' | 'grabbing'>('default');

  // Consolidated mouse state: button states and previous position in one ref
  const mouseStateRef = useRef({
    leftDown: false,
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

        // If space is pressed, we're panning; otherwise drawing
        if (spacePressedRef.current) {
          setCursor('grabbing');
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

      // If left mouse is down and space is pressed, pan; otherwise draw
      if (state.leftDown && spacePressedRef.current) {
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
  }, [viewport, drawing, pan, zoom]);

  // Window-level mouseup (handles drags that end outside canvas)
  useEffect(() => {
    const handleMouseUp = () => {
      const state = mouseStateRef.current;
      state.leftDown = false;
      drawing.stopDrawing();

      // Update cursor based on space key state
      if (spacePressedRef.current) {
        setCursor('grab');
      } else {
        setCursor('default');
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [drawing]);

  // Space key handling for panning mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        spacePressedRef.current = true;
        setCursor('grab');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
        setCursor('default');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block touch-none select-none"
        style={{ cursor }}
      />
    </div>
  );
}
