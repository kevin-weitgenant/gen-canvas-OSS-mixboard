import { useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvasViewport } from '../hooks/useCanvasViewport';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { useCanvasImages } from '../hooks/useCanvasImages';
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard';
import { useCanvasCursor } from '../hooks/useCanvasCursor';
import { useCanvasPointerEvents } from '../hooks/useCanvasPointerEvents';
import { useCanvasStore } from '../store/canvasStore';

/**
 * InfiniteCanvas - Main canvas component for drawing and panning.
 * Composes multiple hooks to handle:
 * - Canvas setup and resizing
 * - Viewport transformations (pan/zoom)
 * - Drawing operations
 * - Keyboard shortcuts (space for temporary pan)
 * - Pointer events (mouse/wheel)
 * - Cursor state management
 */
export function InfiniteCanvas() {
  const { canvasRef, contextRef, resizeCanvas } = useCanvas({ backgroundColor: '#fff' });
  const { viewport, pan, zoom } = useCanvasViewport();
  const drawing = useCanvasDrawing(contextRef, viewport);
  const images = useCanvasImages(contextRef, viewport);
  const drawings = useCanvasStore((state) => state.drawings);
  const imageList = useCanvasStore((state) => state.images);
  const currentTool = useCanvasStore((state) => state.currentTool);

  // Keyboard shortcuts (space key for temporary pan mode)
  const { spacePressed } = useCanvasKeyboard({ currentTool });

  // Pointer events (mouse and wheel interactions)
  const { isDragging } = useCanvasPointerEvents({
    canvasRef,
    viewport,
    drawing,
    pan,
    zoom,
    currentTool,
    spacePressed,
  });

  // Cursor state derived from tool and interaction state
  const { cursor } = useCanvasCursor({ currentTool, spacePressed, isDragging });

  // Drop handlers for images
  const dropHandlers = images.createDropHandlers(canvasRef);

  // Clear and redraw when drawings or images change
  useEffect(() => {
    const context = contextRef.current;
    if (!context) return;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    images.renderAll();
    drawing.redrawAll();
  }, [drawings, imageList, images, drawing]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
      const context = contextRef.current;
      if (!context) return;

      context.fillStyle = '#fff';
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);

      images.renderAll();
      drawing.redrawAll();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas, images, drawing]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block touch-none select-none"
        style={{ cursor }}
        {...dropHandlers}
      />
    </div>
  );
}
