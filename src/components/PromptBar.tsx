import { useState, useRef, useEffect } from "react";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { useImageGeneration } from "../hooks/useImageGeneration";
import { useSelectedModels, useCanvasStore } from "../store/canvasStore";
import { MODEL_NANO_BANANA_2 } from "../constants/imageGeneration";
import { cn } from "../lib/utils";
import { loadImage, readFileAsDataURL } from "../utils/image";
import { ApiKeyPill } from "./ApiKeyPill";
import { handleImageGenerationError } from "../utils/errorHandler";

export function PromptBar() {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generateImage } = useImageGeneration();
  const selectedModels = useSelectedModels();
  const setPromptCreatorModal = useCanvasStore((state) => state.setPromptCreatorModal);
  const viewport = useCanvasStore((state) => state.viewport);
  const addImage = useCanvasStore((state) => state.addImage);
  const setSelectedImageIds = useCanvasStore((state) => state.setSelectedImageIds);
  const setTool = useCanvasStore((state) => state.setTool);

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    const handleCanvasClick = () => {
      inputRef.current?.blur();
    };

    canvas?.addEventListener("mousedown", handleCanvasClick);
    return () => canvas?.removeEventListener("mousedown", handleCanvasClick);
  }, []);

  const canGenerate = prompt.trim() && selectedModels.includes(MODEL_NANO_BANANA_2);

  const handleSubmit = async () => {
    if (!canGenerate) return;

    // Clear input immediately for better UX
    const currentPrompt = prompt;
    setPrompt("");

    try {
      // Each request is independent - parallel generation enabled
      await generateImage(currentPrompt);
    } catch (error) {
      // Restore prompt on error so user can retry
      setPrompt(currentPrompt);
      handleImageGenerationError(error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Calculate center of viewport for positioning
    const viewportCenterX = (-viewport.offsetX + window.innerWidth / 2 / viewport.scale);
    const viewportCenterY = (-viewport.offsetY + window.innerHeight / 2 / viewport.scale);

    const selectedIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      try {
        const dataUrl = await readFileAsDataURL(file);
        const img = await loadImage(dataUrl);

        const imageId = crypto.randomUUID();
        selectedIds.push(imageId);

        addImage({
          id: imageId,
          type: "image",
          src: dataUrl,
          x: viewportCenterX - img.width / 2 + (i * 20), // Slight offset for multiple images
          y: viewportCenterY - img.height / 2 + (i * 20),
          width: img.width,
          height: img.height,
          source: { type: "uploaded" },
        });
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }

    if (selectedIds.length > 0) {
      setSelectedImageIds(selectedIds);
      setTool("selection");
    }

    // Reset the input so the same files can be selected again
    e.target.value = "";
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={handlePlusClick}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50 transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>

      <div className="flex items-center w-[400px] sm:w-[500px] h-12 bg-white rounded-full border border-slate-200 shadow-sm px-4 gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="What do you want to create?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => useCanvasStore.getState().clearSelection()}
          className="flex-1 bg-transparent outline-none text-slate-700 placeholder-[#8A8F9E] font-medium text-[15px]"
        />

        <div className="w-px h-4 bg-slate-200" />

        <button
          onClick={() => setPromptCreatorModal(true)}
          className="relative shrink-0 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-all group"
        >
          <Sparkles size={14} />
          <span
            role="tooltip"
            className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+0.5rem)] z-50 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          >
            Advanced options
          </span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={!canGenerate}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-full transition-colors",
            !canGenerate
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#E5DDF5] text-[#634994] hover:bg-[#DACCEE]"
          )}
        >
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      <ApiKeyPill />
    </div>
  );
}
