import { create } from 'zustand';
import type { LineSegment, Viewport, ImageElement } from '../types/canvas';

export type Tool = 'pen' | 'pan' | 'selection';

interface CanvasState {
  drawings: LineSegment[];
  images: ImageElement[];
  viewport: Viewport;
  currentTool: Tool;
}

interface CanvasActions {
  addDrawing: (drawing: LineSegment) => void;
  setDrawings: (drawings: LineSegment[]) => void;
  addImage: (image: ImageElement) => void;
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
  images: [],
  viewport: INITIAL_VIEWPORT,
  currentTool: 'pen',

  addDrawing: (drawing) =>
    set((state) => ({ drawings: [...state.drawings, drawing] })),

  setDrawings: (drawings) => set({ drawings }),

  addImage: (image) =>
    set((state) => ({ images: [...state.images, image] })),

  setViewport: (viewport) => set({ viewport }),

  clear: () =>
    set({
      drawings: [],
      images: [],
      viewport: INITIAL_VIEWPORT,
    }),

  setTool: (tool) => set({ currentTool: tool }),
}));
