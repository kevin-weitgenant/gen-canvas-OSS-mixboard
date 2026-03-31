import { useRef, useEffect, useCallback } from 'react';

export interface UseCanvasOptions {
  backgroundColor?: string;
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (options.backgroundColor) {
      context.fillStyle = options.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [options.backgroundColor]);

  const clear = useCallback(() => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    context.fillStyle = options.backgroundColor || '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [options.backgroundColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    contextRef.current = context;

    // Set initial canvas size
    resizeCanvas();

    // Handle window resize
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas]);

  return { canvasRef, contextRef, clear, resizeCanvas };
}
