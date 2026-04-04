import { useEffect, useRef } from 'react';
import { Download, GitBranch } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { getImageScreenBox } from '../utils/geometry';

interface ContextMenuProps {
  imageId: string;
  onClose: () => void;
}

export function ContextMenu({ imageId, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const images = useCanvasStore((state) => state.images);
  const viewport = useCanvasStore((state) => state.viewport);
  const image = images.find((img) => img.id === imageId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleDownload = () => {
    console.log('Download image:', image);
    // TODO: Implement download functionality
    onClose();
  };

  const handleGenerateVariations = () => {
    console.log('Generate variations for image:', image);
    // TODO: Implement variations functionality
    onClose();
  };

  // Calculate position: centered above the image
  const menuWidth = 180;
  const menuHeight = 60;
  const offsetAbove = 12;

  let menuX: number;
  let menuY: number;

  if (image) {
    const imageBox = getImageScreenBox(image, viewport);
    // Center horizontally above the image
    menuX = imageBox.x + imageBox.width / 2 - menuWidth / 2;
    menuY = imageBox.y - menuHeight - offsetAbove;

    // Keep menu within viewport bounds
    if (menuX < 8) menuX = 8;
    if (menuX + menuWidth > window.innerWidth - 8) menuX = window.innerWidth - menuWidth - 8;
    if (menuY < 8) menuY = imageBox.y + imageBox.height + offsetAbove;
  } else {
    menuX = window.innerWidth / 2 - menuWidth / 2;
    menuY = window.innerHeight / 2 - menuHeight / 2;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[101] bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200/50 overflow-hidden"
      style={{ left: menuX, top: menuY, width: menuWidth }}
    >
      <div className="flex">
        <button
          onClick={handleDownload}
          className="flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150 outline-none border-r border-slate-200/50"
        >
          <Download className="w-5 h-5 text-slate-500" strokeWidth={2} />
          <span className="text-xs">Download</span>
        </button>
        <button
          onClick={handleGenerateVariations}
          className="flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150 outline-none"
        >
          <GitBranch className="w-5 h-5 text-slate-500" strokeWidth={2} />
          <span className="text-xs">Variations</span>
        </button>
      </div>
    </div>
  );
}
