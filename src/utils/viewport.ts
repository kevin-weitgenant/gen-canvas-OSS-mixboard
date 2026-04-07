import type { Viewport } from '../types/canvas';

export function calculateViewportCenter(
  viewport: Viewport,
  imageSize: number
): { x: number; y: number } {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Use correct transformation matching toTrueX/toTrueY from coordinates.ts
  const worldX = centerX / viewport.scale - viewport.offsetX;
  const worldY = centerY / viewport.scale - viewport.offsetY;

  return {
    x: worldX - imageSize / 2,
    y: worldY - imageSize / 2,
  };
}

interface GridPosition {
  x: number;
  y: number;
}

export function calculateGridPositions(
  viewport: Viewport,
  imageSize: number,
  count: number,
  spacing: number = 20
): GridPosition[] {
  if (count === 0) return [];
  if (count === 1) {
    return [calculateViewportCenter(viewport, imageSize)];
  }

  // Calculate grid dimensions (auto square grid)
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  // Calculate total grid size
  const gridWidth = cols * imageSize + (cols - 1) * spacing;
  const gridHeight = rows * imageSize + (rows - 1) * spacing;

  // Get viewport center in world coordinates
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const worldCenterX = centerX / viewport.scale - viewport.offsetX;
  const worldCenterY = centerY / viewport.scale - viewport.offsetY;

  // Calculate starting position (top-left of grid, centered in viewport)
  const startX = worldCenterX - gridWidth / 2;
  const startY = worldCenterY - gridHeight / 2;

  // Generate positions for each image
  const positions: GridPosition[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push({
      x: startX + col * (imageSize + spacing),
      y: startY + row * (imageSize + spacing),
    });
  }

  return positions;
}
