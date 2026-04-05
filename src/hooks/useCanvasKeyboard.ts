import { useEffect, useState, useRef } from 'react';
import type { RefObject } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { useCanvasClipboard } from './useCanvasClipboard';
import type { Viewport, Tool } from '../types/canvas';

interface UseCanvasKeyboardOptions {
  currentTool: Tool;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  viewport: Viewport;
}

interface UseCanvasKeyboardReturn {
  spacePressed: boolean;
}

/**
 * Handles keyboard shortcuts for canvas interaction.
 * Supports space key for temporary pan mode when using selection tool.
 * Supports Ctrl+C for copying and Ctrl+V for pasting images.
 */
export function useCanvasKeyboard({ currentTool, canvasRef, viewport }: UseCanvasKeyboardOptions): UseCanvasKeyboardReturn {
  const [spacePressed, setSpacePressed] = useState(false);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const clipboard = useCanvasClipboard();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only intercept space key for canvas panning when not focused on input elements
      const isInputFocused = e.target instanceof HTMLInputElement ||
                             e.target instanceof HTMLTextAreaElement;
      if (e.code === 'Space' && currentTool === 'selection' && !isInputFocused) {
        e.preventDefault();
        setSpacePressed(true);
      }

      if ((e.code === 'Delete' || e.code === 'Backspace')) {
        const isInputFocused = e.target instanceof HTMLInputElement ||
                               e.target instanceof HTMLTextAreaElement;
        const selectedImageIds = useCanvasStore.getState().selectedImageIds;
        if (selectedImageIds.length > 0 && !isInputFocused) {
          e.preventDefault();
          useCanvasStore.getState().deleteImages(selectedImageIds);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        useCanvasStore.getState().undo();
      }

      // Copy: Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && !isInputFocused) {
        const selectedImageIds = useCanvasStore.getState().selectedImageIds;
        if (selectedImageIds.length > 0) {
          e.preventDefault();
          clipboard.copyImages(selectedImageIds);
        }
      }

      // Paste: Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV' && !isInputFocused) {
        const clipboardImages = useCanvasStore.getState().clipboardImages;
        if (clipboardImages.length > 0) {
          e.preventDefault();

          const canvas = canvasRef.current;
          if (!canvas) return;

          // Use mouse position if available, otherwise center of canvas
          let screenX: number;
          let screenY: number;

          if (mousePositionRef.current) {
            const rect = canvas.getBoundingClientRect();
            screenX = mousePositionRef.current.x - rect.left;
            screenY = mousePositionRef.current.y - rect.top;
          } else {
            // Fallback to center of canvas
            screenX = canvas.width / 2;
            screenY = canvas.height / 2;
          }

          const canvasX = screenX / viewport.scale - viewport.offsetX;
          const canvasY = screenY / viewport.scale - viewport.offsetY;

          clipboard.pasteImages(canvasX, canvasY);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    // Track mouse position for paste positioning
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [currentTool, viewport, canvasRef, clipboard]);

  return { spacePressed };
}
