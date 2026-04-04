export interface Viewport {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface ImageSource {
  type: 'generated' | 'uploaded';
  prompt?: string; // only when type is 'generated'
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isLoading?: boolean;
  loadingState?: 'idle' | 'creating' | 'polling' | 'success' | 'failed';
  source?: ImageSource;
}

export type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type Tool = 'pan' | 'selection';

// Multi-select types
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectionRectangle {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isActive: boolean;
}

export interface LiveMultiDragState {
  images: Map<string, ImageElement>;
}

export interface LiveMultiResizeState {
  images: Map<string, ImageElement>;
}
