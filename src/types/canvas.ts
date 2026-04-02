export interface Point {
  x: number;
  y: number;
}

export interface LineSegment {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Viewport {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type Tool = 'pen' | 'pan' | 'selection';
