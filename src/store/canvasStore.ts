import { create } from 'zustand';
import type { LineSegment, Viewport } from '../types/canvas';

export type Tool = 'pen' | 'pan';

interface CanvasState {
  drawings: LineSegment[];
  viewport: Viewport;
  currentTool: Tool;
}

interface CanvasActions {
  addDrawing: (drawing: LineSegment) => void;
  setDrawings: (drawings: LineSegment[]) => void;
  setViewport: (viewport: Viewport) => void;
  clear: () => void;
  setTool: (tool: Tool) => void;
}

type CanvasStore = CanvasState & CanvasActions;

const INITIAL_VIEWPORT: Viewport = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  drawings: [],
  viewport: INITIAL_VIEWPORT,
  currentTool: 'pen',

  addDrawing: (drawing) =>
    set((state) => ({ drawings: [...state.drawings, drawing] })),

  setDrawings: (drawings) => set({ drawings }),

  setViewport: (viewport) => set({ viewport }),

  clear: () =>
    set({
      drawings: [],
      viewport: INITIAL_VIEWPORT,
    }),

  setTool: (tool) => set({ currentTool: tool }),
}));
