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

export type DrawingTool = 'pen' | 'eraser';

export interface DrawingState {
  lines: LineSegment[];
  currentTool: DrawingTool;
  color: string;
  lineWidth: number;
}
