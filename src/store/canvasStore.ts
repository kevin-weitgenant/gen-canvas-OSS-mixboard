import { create } from 'zustand';
import { DEFAULT_MODELS } from '../constants/imageGeneration';
import type { Viewport, ImageElement, Tool } from '../types/canvas';

interface CanvasState {
  images: ImageElement[];
  selectedImageId: string | null;
  selectedImageIds: string[];
  selectedModels: string[];
  viewport: Viewport;
  currentTool: Tool;
  undoStack: ImageElement[][];
  contextMenu: { imageId: string } | null;
  variationsModal: { imageId: string } | null;
}

interface CanvasActions {
  addImage: (image: ImageElement) => void;
  updateImage: (id: string, updates: Partial<ImageElement>) => void;
  deleteImages: (ids: string[]) => void;
  undo: () => void;
  setSelectedImageId: (id: string | null) => void;
  setSelectedImageIds: (ids: string[]) => void;
  clearSelection: () => void;
  setViewport: (viewport: Viewport) => void;
  setTool: (tool: Tool) => void;
  moveImageToEnd: (id: string) => void;
  setSelectedModels: (models: string[]) => void;
  toggleModel: (modelId: string) => void;
  setContextMenu: (menu: { imageId: string } | null) => void;
  setVariationsModal: (modal: { imageId: string } | null) => void;
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
  selectedImageIds: [],
  selectedModels: [...DEFAULT_MODELS],
  viewport: INITIAL_VIEWPORT,
  currentTool: 'selection',
  undoStack: [],
  contextMenu: null,
  variationsModal: null,

  addImage: (image) =>
    set((state) => ({ images: [...state.images, image] })),

  updateImage: (id, updates) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates } : img
      ),
    })),

  deleteImages: (ids) =>
    set((state) => {
      const deletedImages = state.images.filter((img) => ids.includes(img.id));
      return {
        images: state.images.filter((img) => !ids.includes(img.id)),
        selectedImageIds: state.selectedImageIds.filter((id) => !ids.includes(id)),
        selectedImageId: ids.includes(state.selectedImageId || '') ? null : state.selectedImageId,
        undoStack: [...state.undoStack, deletedImages],
      };
    }),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const lastDeleted = state.undoStack[state.undoStack.length - 1];
      return {
        images: [...state.images, ...lastDeleted],
        undoStack: state.undoStack.slice(0, -1),
      };
    }),

  setSelectedImageId: (id) =>
    set({
      selectedImageId: id,
      selectedImageIds: id ? [id] : [],
    }),

  setSelectedImageIds: (ids) =>
    set({
      selectedImageIds: ids,
      selectedImageId: ids.length > 0 ? ids[0] : null,
    }),

  clearSelection: () =>
    set({
      selectedImageId: null,
      selectedImageIds: [],
    }),

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

  setSelectedModels: (models) => set({ selectedModels: models }),

  toggleModel: (modelId) =>
    set((state) => ({
      selectedModels: state.selectedModels.includes(modelId)
        ? state.selectedModels.filter((id) => id !== modelId)
        : [...state.selectedModels, modelId],
    })),

  setContextMenu: (menu) => set({ contextMenu: menu }),

  setVariationsModal: (modal) => set({ variationsModal: modal }),
}));

// Selector hooks for common patterns
// Note: These need shallow comparison since they return arrays/objects
export const useSelectedImage = () =>
  useCanvasStore((state) => {
    if (!state.selectedImageId) return null;
    return state.images.find((img) => img.id === state.selectedImageId) || null;
  });

// Get selected image IDs - use this for comparisons to avoid infinite loops
export const useSelectedImageIds = () =>
  useCanvasStore((state) => state.selectedImageIds);

// Get selected models
export const useSelectedModels = () =>
  useCanvasStore((state) => state.selectedModels);
