import { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Images, Trash2, Layers} from 'lucide-react';
import { toast } from 'sonner';
import { PromptInstructionInput } from './PromptInstructionInput';
import { CountSlider } from './variation-modal/CountSlider';
import { ModelList } from './variation-modal/ModelList';
import { createPromptVariationsApiChatVariationsPost } from '../api/generated';
import { useBatchImageGeneration } from '../hooks/useBatchImageGeneration';

export interface PromptEntry {
  id: string;
  text: string;
  models: string[];
}

interface BaseVariationsModalProps {
  onClose: () => void;
  basePrompt?: string;
  baseImageSrc?: string;
  isGenerated?: boolean;
  title?: string;
  description?: string;
  onBasePromptChange?: (prompt: string) => void;
  instructionPlaceholder?: string;
  stepLabel?: string;
  variationLabel?: string;
  emptyInstructionPlaceholder?: string;
  instructionLabel?: string;
}

const GENERATED_INSTRUCTION = 'Modify this {prompt base} to vary style, color, lighting, composition, etc.';

const DEFAULT_PROMPT = 'Abstract modern art painting with bold geometric shapes and vibrant colors on gallery wall';

const SUFFIXES = [
  'in a cinematic, high-contrast dramatic lighting',
  'with a soft watercolor aesthetic and muted pastel tones',
  'reimagined as neon-lit futuristic cyberpunk concept art',
  'in a minimalist black and white graphic composition',
  'with warm golden-hour photography tones',
  'in a vintage analog film grain style',
  'with bold graphic design typographic elements',
  'as a hyper-realistic studio photograph',
];

function makeEntry(text = ''): PromptEntry {
  return { id: crypto.randomUUID(), text, models: ['z-image'] };
}

export function BaseVariationsModal({
  onClose,
  basePrompt: initialBasePrompt = '',
  baseImageSrc,
  isGenerated: isInitiallyGenerated = false,
  title = 'Create Prompts',
  description = 'Generate multiple prompt variations',
  onBasePromptChange,
  instructionPlaceholder = 'Describe how to generate prompt variations of this image',
  stepLabel = 'Configure variations',
  variationLabel = 'Variation',
  instructionLabel,
}: BaseVariationsModalProps) {
  const { generateBatchImages } = useBatchImageGeneration();
  const isGenerated = isInitiallyGenerated && !!initialBasePrompt;
  const [basePrompt, setBasePrompt] = useState(initialBasePrompt || DEFAULT_PROMPT);

  // Sync with external prop changes
  useEffect(() => {
    if (initialBasePrompt) {
      setBasePrompt(initialBasePrompt);
    }
  }, [initialBasePrompt]);

  // Notify parent of changes
  function handleBasePromptChange(prompt: string) {
    setBasePrompt(prompt);
    onBasePromptChange?.(prompt);
  }

  const [instruction, setInstruction] = useState(isGenerated ? GENERATED_INSTRUCTION : '');
  const [count, setCount] = useState(3);
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Build the prompt that will be sent to the API
  const resolvedInstruction = isGenerated
    ? instruction.replace('{prompt base}', basePrompt)
    : instruction;

  async function handleGenerate() {
    setGenerating(true);
    try {
      const resolvedInstruction = isGenerated
        ? instruction.replace('{prompt base}', basePrompt)
        : instruction;

      console.log('🔧 [Variations Modal] Resolved instruction:', resolvedInstruction);

      const response = await createPromptVariationsApiChatVariationsPost({
        instruction: resolvedInstruction,
        count,
      });

      if (response.status === 200 && response.data.prompts) {
        setPrompts(response.data.prompts.map((text) => makeEntry(text)));
      } else {
        throw new Error('Invalid response from API');
      }
      setGenerated(true);
    } catch (error) {
      console.error('❌ [Variations Modal] Failed to generate prompt variations:', error);

      // Extract error message from API response
      let errorMessage = 'AI generation failed. Using fallback generation.';
      let errorDetails = 'Please try again or modify your instruction.';

      if (error && typeof error === 'object') {
        const err = error as { data?: { detail?: { message?: string; original_error?: string } } };
        if (err.data?.detail?.message) {
          errorMessage = err.data.detail.message;
        }
        if (err.data?.detail?.original_error) {
          errorDetails = err.data.detail.original_error;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Show toast with error details
      toast.error(errorMessage, {
        description: errorDetails,
        duration: 999999, // Only dismiss on click
      });

      console.log('⬇️ [Variations Modal] Falling back to suffix-based generation');
      setPrompts(Array.from({ length: count }, (_, i) => makeEntry(
        isGenerated
          ? `${basePrompt}, ${SUFFIXES[i % SUFFIXES.length]}`
          : `Abstract modern art ${SUFFIXES[i % SUFFIXES.length]}`
      )));
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateImages() {
    if (prompts.length === 0) return;

    setGeneratingImages(true);

    try {
      // Collect all prompts from the entries
      const configs = prompts.flatMap((entry) => {
        // For now, each prompt generates one image (Z-Image only)
        // In the future, we might expand by entry.models.length
        return entry.text.trim()
          ? [{ prompt: entry.text, aspectRatio: '1:1' as const }]
          : [];
      });

      if (configs.length === 0) {
        toast.error('No valid prompts to generate', {
          description: 'Please add or edit prompts before generating images.',
        });
        return;
      }

      // Generate all images
      await generateBatchImages(configs);

      onClose();
    } catch (error) {
      console.error('Failed to generate images:', error);
      toast.error('Failed to start image generation', {
        description: 'Please try again.',
      });
    } finally {
      setGeneratingImages(false);
    }
  }

  function updateText(id: string, text: string) {
    setPrompts((ps) => ps.map((p) => (p.id === id ? { ...p, text } : p)));
  }

  function updateModels(id: string, models: string[]) {
    setPrompts((ps) => ps.map((p) => (p.id === id ? { ...p, models } : p)));
  }

  function removeEntry(id: string) {
    setPrompts((ps) => ps.filter((p) => p.id !== id));
  }

  const totalImages = prompts.reduce((acc, p) => acc + p.models.filter(Boolean).length, 0);

  // Handle escape key and backdrop click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      className="fixed inset-0 z-[101] pointer-events-none"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute w-[560px] max-h-[92vh] rounded-xl border border-gray-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col pointer-events-auto"
        style={{
          left: `calc(50% + ${position.x}px)`,
          top: `calc(50% + ${position.y}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Header - Draggable */}
        <header
          className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 border border-blue-200 text-blue-500">
              <Layers size={14} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 leading-none">{title}</h2>
              <p className="text-[0.625rem] text-gray-500 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 bg-transparent border-none cursor-pointer transition-all hover:text-gray-900 hover:bg-slate-100"
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Step 1 - Base Image (only if provided) */}
          {baseImageSrc && (
            <section>
              <div className="flex gap-4 rounded-xl border border-gray-200 bg-slate-50 p-4">
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20 shadow-md">
                    <img src={baseImageSrc} alt="Base image" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label htmlFor="base-prompt" className="text-xs font-semibold text-gray-900">Base prompt</label>
                  {isGenerated ? (
                    <textarea
                      id="base-prompt"
                      value={basePrompt}
                      onChange={(e) => handleBasePromptChange(e.target.value)}
                      rows={3}
                      className="flex-1 resize-none rounded-md border border-blue-400/40 bg-white px-2 py-2 text-xs text-gray-900 leading-relaxed outline-none focus:shadow-[0_0_0_1px_rgba(85,132,255,0.6)]"
                    />
                  ) : (
                    <div className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-2 text-xs text-gray-500 italic leading-relaxed">
                      This image was not generated, it was uploaded
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Step 2 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 border border-gray-200 text-gray-500 text-[0.625rem] font-semibold">
                1
              </div>
              <span className="text-sm font-semibold text-gray-900">{stepLabel}</span>
            </div>

            <PromptInstructionInput value={instruction} basePrompt={isGenerated ? basePrompt : undefined} onChange={setInstruction} placeholder={instructionPlaceholder} label={instructionLabel} />

            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
              <CountSlider value={count} onChange={setCount} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || (!isGenerated && !instruction.trim())}
              title={`Generate ${count} different image prompt variations based on this instruction: ${resolvedInstruction}`}
              className="flex items-center justify-center gap-2 w-full rounded-lg p-3 text-sm font-semibold bg-blue-500 text-white border-none cursor-pointer transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-none hover:shadow-[0_0_20px_rgba(85,132,255,0.3)] disabled:shadow-none"
            >
              <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
              {generating ? 'Generating variations…' : generated ? 'Regenerate prompts' : 'Generate prompts'}
            </button>
          </section>

          {/* Step 3 */}
          {generated && prompts.length > 0 && (
            <section>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[0.625rem] font-semibold">
                  2
                </div>
                <span className="text-sm font-semibold text-gray-900">Generated prompts</span>
                <span className="ml-auto text-xs text-gray-500">{prompts.length} variations · {totalImages} images</span>
              </div>

              <div className="flex flex-col gap-3 mt-3">
                {prompts.map((p, i) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-gray-200 bg-slate-50 p-4 flex flex-col gap-3 transition-colors hover:border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-900">{variationLabel} {i + 1}</span>
                      <button
                        onClick={() => removeEntry(p.id)}
                        disabled={prompts.length <= 1}
                        className="w-6 h-6 flex items-center justify-center rounded text-gray-500 bg-transparent border-none cursor-pointer transition-all hover:text-gray-900 hover:bg-slate-100 disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <textarea
                      value={p.text}
                      onChange={(e) => updateText(p.id, e.target.value)}
                      rows={5}
                      className="w-full resize-y rounded-md border border-gray-200 bg-white px-2 py-2 text-xs text-gray-900 leading-relaxed outline-none focus:shadow-[0_0_0_1px_rgba(85,132,255,1)]"
                    />
                    <ModelList models={p.models} onChange={(models) => updateModels(p.id, models)} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setPrompts((ps) => [...ps, makeEntry()])}
                className="flex items-center justify-center gap-2 w-full mt-3 rounded-lg border border-dashed border-gray-200 p-2 text-xs text-gray-500 bg-transparent cursor-pointer transition-all hover:text-gray-900 hover:bg-slate-50"
              >
                <Plus size={12} />
                Add {variationLabel.toLowerCase()} manually
              </button>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between p-4 border-t border-gray-200 flex-shrink-0 bg-slate-50/60">
          <div className="flex gap-3 text-xs text-gray-500">
            <span><span className={prompts.length > 0 ? 'text-blue-500 font-semibold' : ''}>{prompts.length}</span> prompts</span>
            <span className="text-gray-200">·</span>
            <span><span className={totalImages > 0 ? 'text-blue-500 font-semibold' : ''}>{totalImages}</span> images</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs text-gray-500 bg-transparent border-none cursor-pointer transition-all hover:text-gray-900 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateImages}
              disabled={totalImages === 0 || generatingImages}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-500 border-none cursor-pointer transition-all hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Images size={13} className={generatingImages ? 'animate-spin' : ''} />
              {generatingImages
                ? 'Starting...'
                : totalImages > 0
                  ? `Generate ${totalImages} images`
                  : 'Generate images'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
