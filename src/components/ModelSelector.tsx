import { useState, useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/utils";

interface Model {
  id: string;
  name: string;
  color: string;
}

const models: Model[] = [
  // Seedream Models
  { id: "seedream-3", name: "Seedream 3.0", color: "#10B981" },
  { id: "seedream-4", name: "Seedream 4.0", color: "#10B981" },
  { id: "seedream-4.5", name: "Seedream 4.5", color: "#10B981" },
  { id: "seedream-5-lite", name: "Seedream 5.0 Lite", color: "#10B981" },
  // Google Models
  { id: "imagen4", name: "Imagen4", color: "#3B82F6" },
  { id: "imagen4-fast", name: "Imagen4 Fast", color: "#3B82F6" },
  { id: "imagen4-ultra", name: "Imagen4 Ultra", color: "#3B82F6" },
  { id: "nano-banana", name: "Nano Banana", color: "#F59E0B" },
  { id: "nano-banana-2", name: "Nano Banana 2", color: "#F59E0B" },
  // Flux Models
  { id: "flux-2", name: "Flux-2", color: "#8B5CF6" },
  { id: "flux-2-pro", name: "Flux-2 Pro", color: "#8B5CF6" },
  { id: "flux-kontext", name: "Flux Kontext", color: "#8B5CF6" },
  // OpenAI / GPT Models
  { id: "4o-image", name: "4o Image", color: "#EC4899" },
  { id: "gpt-image-1.5", name: "GPT Image-1.5", color: "#EC4899" },
  // Qwen (Alibaba) Models
  { id: "qwen", name: "Qwen", color: "#F97316" },
  { id: "qwen2", name: "Qwen2", color: "#F97316" },
  // Wan Models
  { id: "wan-2.7-image", name: "Wan 2.7 Image", color: "#06B6D4" },
  { id: "wan-2.7-image-pro", name: "Wan 2.7 Image Pro", color: "#06B6D4" },
  // Standalone & Other Models
  { id: "ideogram-v3", name: "Ideogram V3", color: "#EF4444" },
  { id: "grok-imagine", name: "Grok Imagine", color: "#6366F1" },
  { id: "z-image", name: "Z-Image", color: "#14B8A6" },
];

export function ModelSelector() {
  const [selectedModels, setSelectedModels] = useState<string[]>(["seedream-3", "imagen4"]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

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
        {models.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          return (
            <button
              key={model.id}
              onClick={() => !hasDragged && toggleModel(model.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                isSelected
                  ? "bg-[#634994] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: model.color }}
              />
              {model.name}
              {isSelected && <Check className="w-4 h-4 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
