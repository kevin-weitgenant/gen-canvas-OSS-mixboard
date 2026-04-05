import { useEffect, useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useCanvasViewport } from '../hooks/useCanvasViewport';
import { useCanvasImages } from '../hooks/useCanvasImages';
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard';
import { useCanvasCursor } from '../hooks/useCanvasCursor';
import { useCanvasPointerEvents } from '../hooks/useCanvasPointerEvents';
import { useCanvasContextMenu } from '../hooks/useCanvasContextMenu';
import { useCanvasStore } from '../store/canvasStore';
import { ContextMenu } from './ContextMenu';
import { CreateVariationsModal } from './CreateVariationsModal';
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
  const selectedImageIds = useCanvasStore((state) => state.selectedImageIds);
  const currentTool = useCanvasStore((state) => state.currentTool);

  const { spacePressed } = useCanvasKeyboard({ currentTool, canvasRef, viewport });

  const renderRef = useRef<(() => void) | null>(null);

  const { contextMenu } = useCanvasContextMenu({ canvasRef, viewport });
  const setContextMenu = useCanvasStore((state) => state.setContextMenu);
  const variationsModal = useCanvasStore((state) => state.variationsModal);
  const setVariationsModal = useCanvasStore((state) => state.setVariationsModal);

  const {
    isDragging,
    hoveredHandle,
    getLiveResizeState,
    getLiveDragState,
    getLiveMultiResizeState,
    getLiveMultiDragState,
    getSelectionRect,
  } = useCanvasPointerEvents({
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
    currentTool === 'selection' && hoveredHandle
      ? getCursorForHandle(hoveredHandle)
      : currentTool === 'selection' && selectedImageIds.length > 0
        ? 'move'
        : toolCursor;

  const dropHandlers = images.createDropHandlers();

  const render = () => {
    const context = contextRef.current;
    if (!context) return;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Pass all live states to renderAll
    images.renderAll(
      getLiveResizeState(),
      getLiveDragState(),
      getLiveMultiResizeState(),
      getLiveMultiDragState(),
      getSelectionRect()
    );
  };

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    render();
  }, [imageList, selectedImageIds, render]);

  // Re-render for loading animations
  const hasLoadingImages = imageList.some(img => img.isLoading);
  useEffect(() => {
    if (!hasLoadingImages) return;
    const interval = setInterval(render, 500);
    return () => clearInterval(interval);
  }, [hasLoadingImages, render]);

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
      {contextMenu && (
        <ContextMenu
          imageId={contextMenu.imageId}
          onClose={() => setContextMenu(null)}
        />
      )}
      {variationsModal && (
        <CreateVariationsModal
          imageId={variationsModal.imageId}
          onClose={() => setVariationsModal(null)}
        />
      )}
    </div>
  );
}
