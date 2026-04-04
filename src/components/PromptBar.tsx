import { useState, useRef, useEffect } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { useImageGeneration } from "../hooks/useImageGeneration";
import { useSelectedModels, useCanvasStore } from "../store/canvasStore";
import { MODEL_Z_IMAGE } from "../constants/imageGeneration";
import { cn } from "../lib/utils";

export function PromptBar() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { generateImage } = useImageGeneration();
  const selectedModels = useSelectedModels();

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    const handleCanvasClick = () => {
      inputRef.current?.blur();
    };

    canvas?.addEventListener("mousedown", handleCanvasClick);
    return () => canvas?.removeEventListener("mousedown", handleCanvasClick);
  }, []);

  const canGenerate = prompt.trim() && !isGenerating && selectedModels.includes(MODEL_Z_IMAGE);

  const handleSubmit = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      await generateImage(prompt);
      setPrompt("");
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3">
      <button className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50 transition-colors">
        <Plus className="w-5 h-5" />
      </button>

      <div className="relative flex items-center w-[400px] sm:w-[500px] h-12 bg-white rounded-full border border-slate-200 shadow-sm">
        <input
          ref={inputRef}
          type="text"
          placeholder="What do you want to create?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => useCanvasStore.getState().clearSelection()}
          disabled={isGenerating}
          className="w-full h-full bg-transparent pl-5 pr-14 rounded-full outline-none text-slate-700 placeholder-[#8A8F9E] font-medium text-[15px] disabled:opacity-50"
        />

        <button
          onClick={handleSubmit}
          disabled={!canGenerate}
          className={cn(
            "absolute right-1.5 flex items-center justify-center w-9 h-9 rounded-full transition-colors",
            !canGenerate
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#E5DDF5] text-[#634994] hover:bg-[#DACCEE]"
          )}
        >
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
