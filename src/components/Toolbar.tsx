import { Hand, MousePointer2 } from "lucide-react";
import { useCanvasStore } from "../store/canvasStore";

export function Toolbar() {
  const currentTool = useCanvasStore((state) => state.currentTool);
  const setTool = useCanvasStore((state) => state.setTool);

  const tools = [
    { id: 'selection', icon: MousePointer2, label: 'Select' },
    { id: 'pan', icon: Hand, label: 'Pan' },
  ] as const;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100]">
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F0F3F9] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/50">
        {tools.map(({ id, icon: Icon, label }) => {
          const isActive = currentTool === id;
          return (
            <button
              key={id}
              onClick={() => setTool(id)}
              title={label}
              className={`
                group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 outline-none
                ${isActive 
                  ? "bg-[#DDE4EE] text-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]" 
                  : "text-slate-500 hover:bg-[#E6EBF3] hover:text-slate-800"
                }
              `}
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} 
                strokeWidth={isActive ? 2.5 : 2.5} 
                fill={isActive && id === 'selection' ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
