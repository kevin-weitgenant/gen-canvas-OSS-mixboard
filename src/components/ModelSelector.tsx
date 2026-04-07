import { useRef, useState } from "react";
import { Check, Ban } from "lucide-react";
import { cn } from "../lib/utils";
import { useCanvasStore, useSelectedModels } from "../store/canvasStore";
import { KIE_AI_MODELS, ENABLED_MODEL } from "./modelConstants";

export function ModelSelector() {
  const selectedModels = useSelectedModels();
  const toggleModel = useCanvasStore((state) => state.toggleModel);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed bottom-28 left-0 right-0 z-[99] px-4">
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-2 overflow-x-auto pb-2 select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {[...KIE_AI_MODELS].sort((a, b) => {
          if (a.id === 'z-image') return -1;
          if (b.id === 'z-image') return 1;
          const aEnabled = a.id === ENABLED_MODEL;
          const bEnabled = b.id === ENABLED_MODEL;
          if (aEnabled && !bEnabled) return -1;
          if (!aEnabled && bEnabled) return 1;
          return a.name.localeCompare(b.name);
        }).map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const isEnabled = model.id === ENABLED_MODEL;
          return (
            <button
              key={model.id}
              onClick={() => !hasDragged && isEnabled && toggleModel(model.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                isSelected && isEnabled
                  ? "bg-[#634994] text-white"
                  : isEnabled
                    ? "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isEnabled ? model.color : "#94a3b8" }}
              />
              {model.name}
              {isSelected && isEnabled && <Check className="w-4 h-4 shrink-0" />}
              {!isEnabled && <Ban className="w-3 h-3 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
