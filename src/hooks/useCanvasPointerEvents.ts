import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Viewport, ImageElement, Tool, SelectionRectangle, LiveMultiResizeState, LiveMultiDragState } from '../types/canvas';
import { isPointInImage, getBoundingBoxHandleAtPoint, isPointInBoundingBox, doesImageIntersectRect } from '../utils/hitTest';
import { getBoundingBoxScreenBox } from '../utils/geometry';
import { useCanvasStore } from '../store/canvasStore';
import { useCanvasSelection } from './useCanvasSelection';
import { useCanvasImageResize } from './useCanvasImageResize';
import { useCanvasImageDrag } from './useCanvasImageDrag';
import { useCanvasMultiDrag } from './useCanvasMultiDrag';
import { useCanvasMultiResize } from './useCanvasMultiResize';

interface PanCallbacks {
  pan: (deltaX: number, deltaY: number, scale: number) => void;
  zoom: (scaleAmount: number, centerX: number, centerY: number, canvasWidth: number, canvasHeight: number) => void;
}

interface UseCanvasPointerEventsOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  viewport: Viewport;
  pan: PanCallbacks['pan'];
  zoom: PanCallbacks['zoom'];
  currentTool: Tool;
  spacePressed: boolean;
  onRender?: () => void;
}

interface UseCanvasPointerEventsReturn {
  isDragging: boolean;
  hoveredHandle: ReturnType<typeof useCanvasImageResize>['hoveredHandle'];
  getLiveResizeState: () => import('./useCanvasImageResize').LiveResizeState | null;
  getLiveDragState: () => import('./useCanvasImageDrag').LiveDragState | null;
  getLiveMultiResizeState: () => LiveMultiResizeState | null;
  getLiveMultiDragState: () => LiveMultiDragState | null;
  getSelectionRect: () => SelectionRectangle | null;
}

interface MouseState {
  leftDown: boolean;
  prevX: number;
  prevY: number;
  hasPosition: boolean;
}

const MIN_SELECTION_SIZE = 5;

/**
 * Handles pointer events for the canvas.
 * Coordinates between different tool modes (pan, draw, selection).
 */
export function useCanvasPointerEvents({
  canvasRef,
  viewport,
  pan,
  zoom,
  currentTool,
  spacePressed,
  onRender,
}: UseCanvasPointerEventsOptions): UseCanvasPointerEventsReturn {
  const [isDragging, setIsDragging] = useState(false);

  const mouseStateRef = useRef<MouseState>({
    leftDown: false,
    prevX: 0,
    prevY: 0,
    hasPosition: false,
  });

  const selectionRectRef = useRef<SelectionRectangle>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isActive: false,
  });

  const selection = useCanvasSelection(viewport);
  const resize = useCanvasImageResize(viewport);
  const drag = useCanvasImageDrag(viewport.scale);
  const multiDrag = useCanvasMultiDrag(viewport.scale);
  const multiResize = useCanvasMultiResize(viewport.scale);

  const isPanMode = () => currentTool === 'pan' || spacePressed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (e.target !== canvas) return;
      e.preventDefault();

      const state = mouseStateRef.current;
      state.leftDown = true;
      state.prevX = e.pageX;
      state.prevY = e.pageY;
      state.hasPosition = true;

      if (isPanMode()) {
        setIsDragging(true);
      } else if (currentTool === 'selection') {
        const store = useCanvasStore.getState();
        const images = store.images;
        const selectedIds = store.selectedImageIds;

        // Check if clicking on multi-select bounding box handle
        if (selectedIds.length > 1) {
          const selectedImgs = images.filter((img) => selectedIds.includes(img.id));
          const boundingBox = getBoundingBoxScreenBox(selectedImgs, viewport);
          if (boundingBox) {
            const handle = getBoundingBoxHandleAtPoint(e.pageX, e.pageY, boundingBox);
            if (handle) {
              multiResize.startMultiResize(handle, selectedImgs, e.pageX, e.pageY);
              setIsDragging(true);
              return;
            }
          }
        }

        // Check single image resize handle
        const handle = selection.getHandleAtPoint(e.pageX, e.pageY);
        if (handle && selectedIds.length === 1) {
          const selectedImg = images.find((img) => img.id === selectedIds[0]);
          if (selectedImg) {
            resize.startResize(handle, selectedImg, e.pageX, e.pageY);
            setIsDragging(true);
            return;
          }
        }

        // Check if clicking on any image (iterate in reverse for z-order)
        let clickedImage: ImageElement | null = null;
        for (let i = images.length - 1; i >= 0; i--) {
          if (isPointInImage(e.pageX, e.pageY, images[i], viewport)) {
            clickedImage = images[i];
            break;
          }
        }

        if (clickedImage) {
          // Check if clicking inside multi-select bounding box
          if (selectedIds.length > 1) {
            const selectedImgs = images.filter((img) => selectedIds.includes(img.id));
            const boundingBox = getBoundingBoxScreenBox(selectedImgs, viewport);
            if (boundingBox && isPointInBoundingBox(e.pageX, e.pageY, boundingBox)) {
              // Move all selected images
              multiDrag.startMultiDrag(selectedImgs, e.pageX, e.pageY);
              setIsDragging(true);
              return;
            }
          }

          // Single image selection
          store.setSelectedImageIds([clickedImage.id]);
          store.moveImageToEnd(clickedImage.id);
          drag.startDrag(clickedImage, e.pageX, e.pageY);
          setIsDragging(true);
        } else {
          // Clicked on empty space - start selection rectangle
          selectionRectRef.current = {
            startX: e.pageX,
            startY: e.pageY,
            currentX: e.pageX,
            currentY: e.pageY,
            isActive: true,
          };
          setIsDragging(true);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = mouseStateRef.current;
      if (!state.hasPosition) return;

      const screenX = e.pageX;
      const screenY = e.pageY;

      if (state.leftDown && isPanMode()) {
        const deltaX = screenX - state.prevX;
        const deltaY = screenY - state.prevY;
        pan(deltaX, deltaY, viewport.scale);
      } else if (state.leftDown && currentTool === 'selection') {
        // Multi-resize takes priority
        if (multiResize.isActive()) {
          if (multiResize.updateMultiResize(screenX, screenY)) {
            onRender?.();
          }
        }
        // Then single resize
        else if (resize.isActive()) {
          const selectedIds = useCanvasStore.getState().selectedImageIds;
          if (selectedIds.length === 1) {
            const selectedImg = useCanvasStore.getState().images.find((img) => img.id === selectedIds[0]);
            if (selectedImg && resize.updateResize(screenX, screenY, selectedImg)) {
              onRender?.();
            }
          }
        }
        // Then multi-drag
        else if (multiDrag.isActive()) {
          const currentSelected = useCanvasStore.getState().selectedImageIds
            .map((id) => useCanvasStore.getState().images.find((img) => img.id === id))
            .filter((img): img is ImageElement => img !== undefined);
          if (multiDrag.updateMultiDrag(screenX, screenY, currentSelected)) {
            onRender?.();
          }
        }
        // Then single drag
        else if (drag.isActive()) {
          const selectedIds = useCanvasStore.getState().selectedImageIds;
          if (selectedIds.length === 1) {
            const selectedImg = useCanvasStore.getState().images.find((img) => img.id === selectedIds[0]);
            if (selectedImg && drag.updateDrag(screenX, screenY, selectedImg)) {
              onRender?.();
            }
          }
        }
        // Then selection rectangle
        else if (selectionRectRef.current.isActive) {
          selectionRectRef.current.currentX = screenX;
          selectionRectRef.current.currentY = screenY;
          onRender?.();
        }
      } else if (currentTool === 'selection') {
        // Handle hover state for resize handles
        const selectedIds = useCanvasStore.getState().selectedImageIds;

        if (selectedIds.length > 1) {
          const selectedImgs = useCanvasStore.getState().images.filter((img) =>
            selectedIds.includes(img.id)
          );
          const boundingBox = getBoundingBoxScreenBox(selectedImgs, viewport);
          if (boundingBox) {
            const handle = getBoundingBoxHandleAtPoint(screenX, screenY, boundingBox);
            resize.setHoveredHandle(handle);
          }
        } else if (selectedIds.length === 1) {
          const handle = selection.getHandleAtPoint(screenX, screenY);
          resize.setHoveredHandle(handle);
        } else {
          resize.setHoveredHandle(null);
        }
      }

      state.prevX = screenX;
      state.prevY = screenY;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleAmount = -e.deltaY / 500;
      zoom(scaleAmount, e.pageX, e.pageY, canvas.width, canvas.height);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [
    viewport,
    pan,
    zoom,
    currentTool,
    spacePressed,
    selection,
    resize,
    drag,
    multiDrag,
    multiResize,
    onRender,
  ]);

  useEffect(() => {
    const handleMouseUp = () => {
      mouseStateRef.current.leftDown = false;

      const store = useCanvasStore.getState();
      const selectedIds = store.selectedImageIds;
      const images = store.images;

      // Handle selection rectangle finalization
      if (selectionRectRef.current.isActive) {
        const rect = selectionRectRef.current;
        const x = Math.min(rect.startX, rect.currentX);
        const y = Math.min(rect.startY, rect.currentY);
        const width = Math.abs(rect.currentX - rect.startX);
        const height = Math.abs(rect.currentY - rect.startY);

        // Only select if rectangle is large enough (avoid accidental clicks)
        if (width > MIN_SELECTION_SIZE || height > MIN_SELECTION_SIZE) {
          const intersectingIds = images
            .filter((img) => doesImageIntersectRect({ x, y, width, height }, img, viewport))
            .map((img) => img.id);

          if (intersectingIds.length > 0) {
            store.setSelectedImageIds(intersectingIds);
          } else {
            store.clearSelection();
          }
        } else {
          // Small click on empty space clears selection
          store.clearSelection();
        }

        selectionRectRef.current.isActive = false;
        onRender?.();
      }

      // Handle single resize commit
      if (resize.isActive() && selectedIds.length === 1) {
        const selectedImg = images.find((img) => img.id === selectedIds[0]);
        if (selectedImg) {
          const sizeUpdate = resize.commitResize(selectedImg.id);
          if (sizeUpdate) {
            store.updateImage(selectedImg.id, sizeUpdate);
          }
        }
      }

      // Handle single drag commit
      if (drag.isActive() && selectedIds.length === 1) {
        const selectedImg = images.find((img) => img.id === selectedIds[0]);
        if (selectedImg) {
          const posUpdate = drag.commitDrag(selectedImg.id);
          if (posUpdate) {
            store.updateImage(selectedImg.id, posUpdate);
          }
        }
      }

      // Handle multi-resize commit
      if (multiResize.isActive()) {
        const updates = multiResize.commitMultiResize();
        for (const { id, updates: imgUpdates } of updates) {
          store.updateImage(id, imgUpdates);
        }
      }

      // Handle multi-drag commit
      if (multiDrag.isActive()) {
        const updates = multiDrag.commitMultiDrag();
        for (const { id, updates: imgUpdates } of updates) {
          store.updateImage(id, imgUpdates);
        }
      }

      resize.cancelResize();
      drag.cancelDrag();
      multiResize.cancelMultiResize();
      multiDrag.cancelMultiDrag();
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [resize, drag, multiResize, multiDrag, viewport, onRender]);

  return {
    isDragging,
    hoveredHandle: resize.hoveredHandle,
    getLiveResizeState: resize.getLiveResizeState,
    getLiveDragState: drag.getLiveDragState,
    getLiveMultiResizeState: multiResize.getLiveMultiResizeState,
    getLiveMultiDragState: multiDrag.getLiveMultiDragState,
    getSelectionRect: () => (selectionRectRef.current.isActive ? selectionRectRef.current : null),
  };
}
