import { Hand, MousePointer, Trash2 } from "lucide-react";
import { useCanvasStore } from "../store/canvasStore";

const buttonClasses = "relative p-3 rounded-xl transition-all duration-200 cursor-pointer";

const activeClasses = "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105";

const inactiveClasses = "bg-white text-gray-600 hover:bg-gray-50 hover:scale-105 border border-gray-200";

export function Toolbar() {
  const currentTool = useCanvasStore((state) => state.currentTool);
  const setTool = useCanvasStore((state) => state.setTool);
  const clear = useCanvasStore((state) => state.clear);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 z-[100]">
      <button
        onClick={() => setTool('selection')}
        title="Selection Tool"
        className={`${buttonClasses} ${currentTool === 'selection' ? activeClasses : inactiveClasses}`}
      >
        <MousePointer className="w-5 h-5" strokeWidth={2.5} />
      </button>
      <button
        onClick={() => setTool('pan')}
        title="Pan Tool"
        className={`${buttonClasses} ${currentTool === 'pan' ? activeClasses : inactiveClasses}`}
      >
        <Hand className="w-5 h-5" strokeWidth={2.5} />
      </button>
      <div className="w-px h-8 bg-gray-200 mx-1" />
      <button
        onClick={clear}
        title="Clear Canvas"
        className={`${buttonClasses} ${inactiveClasses} hover:text-red-500 hover:border-red-200 hover:bg-red-50`}
      >
        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
