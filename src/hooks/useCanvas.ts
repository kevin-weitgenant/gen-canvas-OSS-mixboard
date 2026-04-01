import { useRef, useEffect } from 'react';

export interface UseCanvasOptions {
  backgroundColor?: string;
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  function resizeCanvas() {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (options.backgroundColor) {
      context.fillStyle = options.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    contextRef.current = context;

    // Set initial canvas size
    resizeCanvas();
  }, [resizeCanvas]);

  return { canvasRef, contextRef, resizeCanvas };
}
