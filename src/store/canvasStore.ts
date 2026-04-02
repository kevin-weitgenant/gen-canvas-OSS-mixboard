import { create } from 'zustand';
import type { LineSegment, Viewport, ImageElement, Tool } from '../types/canvas';

interface CanvasState {
  drawings: LineSegment[];
  images: ImageElement[];
  selectedImageId: string | null;
  viewport: Viewport;
  currentTool: Tool;
}

interface CanvasActions {
  addDrawing: (drawing: LineSegment) => void;
  setDrawings: (drawings: LineSegment[]) => void;
  addImage: (image: ImageElement) => void;
  updateImage: (id: string, updates: Partial<ImageElement>) => void;
  setSelectedImageId: (id: string | null) => void;
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
  selectedImageId: null,
  viewport: INITIAL_VIEWPORT,
  currentTool: 'pen',

  addDrawing: (drawing) =>
    set((state) => ({ drawings: [...state.drawings, drawing] })),

  setDrawings: (drawings) => set({ drawings }),

  addImage: (image) =>
    set((state) => ({ images: [...state.images, image] })),

  updateImage: (id, updates) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
    })),

  setSelectedImageId: (id) => set({ selectedImageId: id }),

  setViewport: (viewport) => set({ viewport }),

  clear: () =>
    set({
      drawings: [],
      images: [],
      selectedImageId: null,
      viewport: INITIAL_VIEWPORT,
    }),

  setTool: (tool) => set({ currentTool: tool }),
}));

// Selector hooks for common patterns
export const useSelectedImage = () =>
  useCanvasStore((state) => {
    if (!state.selectedImageId) return null;
    return state.images.find((img) => img.id === state.selectedImageId) || null;
  });
