import { useEffect, useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvasViewport } from '../hooks/useCanvasViewport';
import { useCanvasImages } from '../hooks/useCanvasImages';
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard';
import { useCanvasCursor } from '../hooks/useCanvasCursor';
import { useCanvasPointerEvents } from '../hooks/useCanvasPointerEvents';
import { useCanvasStore } from '../store/canvasStore';
import type { ResizeHandle } from '../types/canvas';

const CURSORS: Record<ResizeHandle, string> = {
  'top-left': 'nwse-resize',
  'top-right': 'nesw-resize',
  'bottom-left': 'nesw-resize',
  'bottom-right': 'nwse-resize',
};

function getCursorForHandle(handle: ResizeHandle | null): string {
  return handle ? CURSORS[handle] : 'default';
}

/**
 * InfiniteCanvas - Main canvas component for image manipulation and panning.
 */
export function InfiniteCanvas() {
  const { canvasRef, contextRef, resizeCanvas } = useCanvas({ backgroundColor: '#fff' });
  const { viewport, pan, zoom } = useCanvasViewport();
  const images = useCanvasImages(contextRef, viewport);

  const imageList = useCanvasStore((state) => state.images);
  const selectedImageId = useCanvasStore((state) => state.selectedImageId);
  const currentTool = useCanvasStore((state) => state.currentTool);

  const { spacePressed } = useCanvasKeyboard({ currentTool });

  const renderRef = useRef<(() => void) | null>(null);

  const { isDragging, hoveredHandle, getLiveResizeState, getLiveDragState } = useCanvasPointerEvents({
    canvasRef,
    viewport,
    pan,
    zoom,
    currentTool,
    spacePressed,
    onRender: () => renderRef.current?.(),
  });

  const { cursor: toolCursor } = useCanvasCursor({ currentTool, spacePressed, isDragging });

  const cursor =
    currentTool === 'selection' && hoveredHandle ? getCursorForHandle(hoveredHandle)
    : currentTool === 'selection' && selectedImageId ? 'move'
    : toolCursor;

  const dropHandlers = images.createDropHandlers();

  const render = () => {
    const context = contextRef.current;
    if (!context) return;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Use live state for drag or resize (only one active at a time)
    const liveState = getLiveResizeState() ?? getLiveDragState();
    images.renderAll(liveState);
  };

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    render();
  }, [imageList, selectedImageId, render]);

  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
      render();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas, render]);

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
