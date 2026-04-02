import type { Tool } from '../types/canvas';

type CursorState = 'default' | 'grab' | 'grabbing';

interface UseCanvasCursorOptions {
  currentTool: Tool;
  spacePressed: boolean;
  isDragging: boolean;
}

interface UseCanvasCursorReturn {
  cursor: CursorState;
}

/**
 * Derives cursor state from tool and interaction state.
 * Returns appropriate cursor for pan/selection modes and dragging state.
 */
export function useCanvasCursor({ currentTool, spacePressed, isDragging }: UseCanvasCursorOptions): UseCanvasCursorReturn {
  const cursor: CursorState = isDragging
    ? 'grabbing'
    : (currentTool === 'pan' || spacePressed)
      ? 'grab'
      : 'default';

  return { cursor };
}
