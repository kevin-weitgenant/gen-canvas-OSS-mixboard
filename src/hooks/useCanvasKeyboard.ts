import { useEffect, useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import type { Tool } from '../types/canvas';

interface UseCanvasKeyboardOptions {
  currentTool: Tool;
}

interface UseCanvasKeyboardReturn {
  spacePressed: boolean;
}

/**
 * Handles keyboard shortcuts for canvas interaction.
 * Supports space key for temporary pan mode when using selection tool.
 */
export function useCanvasKeyboard({ currentTool }: UseCanvasKeyboardOptions): UseCanvasKeyboardReturn {
  const [spacePressed, setSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && currentTool === 'selection') {
        e.preventDefault();
        setSpacePressed(true);
      }

      if ((e.code === 'Delete' || e.code === 'Backspace')) {
        const selectedImageIds = useCanvasStore.getState().selectedImageIds;
        if (selectedImageIds.length > 0) {
          e.preventDefault();
          useCanvasStore.getState().deleteImages(selectedImageIds);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        useCanvasStore.getState().undo();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentTool]);

  return { spacePressed };
}
