import type { Viewport } from '../types/canvas';
import { toScreenX, toScreenY } from '../utils/coordinates';
import { useCanvasStore } from '../store/canvasStore';

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface DropHandlers {
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function useCanvasImages(
  contextRef: React.RefObject<CanvasRenderingContext2D | null>,
  viewport: Viewport
) {
  function renderAll() {
    const context = contextRef.current;
    if (!context) return;

    const images = useCanvasStore.getState().images;
    for (const imageEl of images) {
      loadImage(imageEl.src).then((img) => {
        const ctx = contextRef.current;
        if (!ctx) return;
        const screenX = toScreenX(imageEl.x, viewport);
        const screenY = toScreenY(imageEl.y, viewport);
        const screenWidth = imageEl.width * viewport.scale;
        const screenHeight = imageEl.height * viewport.scale;
        ctx.drawImage(img, screenX, screenY, screenWidth, screenHeight);
      });
    }
  }

  function createDropHandlers(canvasRef: React.RefObject<HTMLCanvasElement | null>): DropHandlers {
    function handleDragOver(e: React.DragEvent) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }

    async function handleDrop(e: React.DragEvent) {
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const canvasX = screenX / viewport.scale - viewport.offsetX;
      const canvasY = screenY / viewport.scale - viewport.offsetY;

      for (const file of imageFiles) {
        const dataUrl = await readFileAsDataURL(file);
        const img = await loadImage(dataUrl);

        useCanvasStore.getState().addImage({
          id: crypto.randomUUID(),
          type: 'image',
          src: dataUrl,
          x: canvasX,
          y: canvasY,
          width: img.width,
          height: img.height,
        });
      }
    }

    return { onDragOver: handleDragOver, onDrop: handleDrop };
  }

  return {
    renderAll,
    createDropHandlers,
  };
}
