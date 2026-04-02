import { create } from 'zustand';
import type { Viewport, ImageElement, Tool } from '../types/canvas';

interface CanvasState {
  images: ImageElement[];
  selectedImageId: string | null;
  viewport: Viewport;
  currentTool: Tool;
}

interface CanvasActions {
  addImage: (image: ImageElement) => void;
  updateImage: (id: string, updates: Partial<ImageElement>) => void;
  setSelectedImageId: (id: string | null) => void;
  setViewport: (viewport: Viewport) => void;
  setTool: (tool: Tool) => void;
  moveImageToEnd: (id: string) => void;
}

type CanvasStore = CanvasState & CanvasActions;

const INITIAL_VIEWPORT: Viewport = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  images: [],
  selectedImageId: null,
  viewport: INITIAL_VIEWPORT,
  currentTool: 'selection',

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

  setTool: (tool) => set({ currentTool: tool }),

  moveImageToEnd: (id) =>
    set((state) => {
      const image = state.images.find((img) => img.id === id);
      if (!image) return state;
      return {
        images: [...state.images.filter((img) => img.id !== id), image],
      };
    }),
}));

// Selector hooks for common patterns
export const useSelectedImage = () =>
  useCanvasStore((state) => {
    if (!state.selectedImageId) return null;
    return state.images.find((img) => img.id === state.selectedImageId) || null;
  });
