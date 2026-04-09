// Core model definition with color coding for UI display
export interface CoreModel {
  id: string;
  name: string;
  color: string;
}

// Model definition with tags for combobox display
export interface Model {
  value: string;
  label: string;
  tag: string;
}

// Centralized list of kie.ai models - single source of truth
export const KIE_AI_MODELS: CoreModel[] = [
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
];

// Tag categories mapped to model IDs
const MODEL_TAGS: Record<string, string> = {
  "seedream-3": "Seedream",
  "seedream-4": "Seedream",
  "seedream-4.5": "Seedream",
  "seedream-5-lite": "Seedream",
  "imagen4": "Google",
  "imagen4-fast": "Google",
  "imagen4-ultra": "Google",
  "nano-banana": "Google",
  "nano-banana-2": "Google",
  "flux-2": "Flux",
  "flux-2-pro": "Flux",
  "flux-kontext": "Flux",
  "4o-image": "OpenAI",
  "gpt-image-1.5": "OpenAI",
  "qwen": "Alibaba",
  "qwen2": "Alibaba",
  "wan-2.7-image": "Wan",
  "wan-2.7-image-pro": "Wan",
  "ideogram-v3": "Ideogram",
  "grok-imagine": "Grok",
};

// MODELS array for ModelCombobox - derived from KIE_AI_MODELS
export const MODELS: Model[] = KIE_AI_MODELS.map((model) => ({
  value: model.id,
  label: model.name,
  tag: MODEL_TAGS[model.id] || "Other",
}));

// Tag styles for display in ModelCombobox
export const TAG_STYLES: Record<string, string> = {
  "Seedream": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Google": "bg-blue-50 text-blue-700 border-blue-200",
  "Flux": "bg-violet-50 text-violet-700 border-violet-200",
  "OpenAI": "bg-pink-50 text-pink-700 border-pink-200",
  "Alibaba": "bg-orange-50 text-orange-700 border-orange-200",
  "Wan": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Ideogram": "bg-red-50 text-red-700 border-red-200",
  "Grok": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Other": "bg-slate-100 text-slate-600 border-slate-200",
};

export const DEFAULT_TAG_STYLE = "bg-slate-100 text-slate-600 border-slate-200";

// Currently enabled model - only this model can be selected
export const ENABLED_MODEL = "nano-banana-2";
