import { useEffect, useState } from 'react';
import type { Tool } from '../types/canvas';

interface UseCanvasKeyboardOptions {
  currentTool: Tool;
}

interface UseCanvasKeyboardReturn {
  spacePressed: boolean;
}

/**
 * Handles keyboard shortcuts for canvas interaction.
 * Currently supports space key for temporary pan mode.
 */
export function useCanvasKeyboard({ currentTool }: UseCanvasKeyboardOptions): UseCanvasKeyboardReturn {
  const [spacePressed, setSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && currentTool === 'pen') {
        e.preventDefault();
        setSpacePressed(true);
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
