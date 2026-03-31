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
