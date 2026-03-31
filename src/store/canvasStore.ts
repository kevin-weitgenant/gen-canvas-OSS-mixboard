import { create } from 'zustand';
import type { LineSegment, Viewport } from '../types/canvas';

interface CanvasState {
  drawings: LineSegment[];
  viewport: Viewport;
}

interface CanvasActions {
  addDrawing: (drawing: LineSegment) => void;
  setDrawings: (drawings: LineSegment[]) => void;
  setViewport: (viewport: Viewport) => void;
  clear: () => void;
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

  addDrawing: (drawing) =>
    set((state) => ({ drawings: [...state.drawings, drawing] })),

  setDrawings: (drawings) => set({ drawings }),

  setViewport: (viewport) => set({ viewport }),

  clear: () =>
    set({
      drawings: [],
      viewport: INITIAL_VIEWPORT,
    }),
}));
