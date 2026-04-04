import { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Images, Trash2, Layers, PlusCircle, XCircle } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { PromptInstructionInput } from './PromptInstructionInput';
import { ModelCombobox } from './ModelCombobox';

interface PromptEntry {
  id: string;
  text: string;
  models: string[];
}

interface CreateVariationsModalProps {
  imageId: string;
  onClose: () => void;
}

const DEFAULT_INSTRUCTION = 'Modify this {prompt base} to vary style, color, lighting, composition, etc.';

const MIN_VARIATIONS = 1;
const MAX_VARIATIONS = 8;

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
  return { id: crypto.randomUUID(), text, models: ['flux-dev'] };
}

// Count Slider Component
function CountSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Number of variations</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange(Math.max(MIN_VARIATIONS, value - 1))}
            className="w-5 h-5 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 cursor-pointer transition-all hover:text-gray-900 hover:bg-slate-50"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={8}
            value={value}
            onChange={(e) => {
              const n = Math.max(MIN_VARIATIONS, Math.min(MAX_VARIATIONS, Number(e.target.value)));
              if (!isNaN(n)) onChange(n);
            }}
            className="w-9 text-center rounded-md border border-blue-400/40 bg-white px-1 py-0.5 text-sm font-semibold text-gray-900 outline-none focus:shadow-[0_0_0_1px_rgba(85,132,255,0.4)]"
          />
          <button
            type="button"
            onClick={() => onChange(Math.min(MAX_VARIATIONS, value + 1))}
            className="w-5 h-5 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 cursor-pointer transition-all hover:text-gray-900 hover:bg-slate-50"
          >
            +
          </button>
        </div>
      </div>
      <div className="relative flex items-center h-5">
        <div
          className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-[#6d4fff] to-[#5584ff] transition-all"
          style={{ width: `${((value - MIN_VARIATIONS) / (MAX_VARIATIONS - MIN_VARIATIONS)) * 100}%` }}
        >
          <div className="absolute inset-0 rounded-full bg-slate-200 -z-10" />
        </div>
        <input
          type="range"
          min={MIN_VARIATIONS}
          max={MAX_VARIATIONS}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(85,132,255,0.2),0_1px_4px_rgba(0,0,0,0.1)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb:hover]:shadow-[0_0_0_5px_rgba(85,132,255,0.18),0_1px_6px_rgba(0,0,0,0.12)]"
        />
      </div>
      <div className="flex justify-between px-px">
        {Array.from({ length: MAX_VARIATIONS }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-4 text-center text-[0.625rem] bg-transparent border-none cursor-pointer transition-colors ${n === value ? 'text-blue-500 font-semibold' : 'text-gray-400 hover:text-gray-500'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// Model List Component
function ModelList({ models, onChange }: { models: string[]; onChange: (models: string[]) => void }) {
  function updateModel(idx: number, val: string) {
    onChange(models.map((m, i) => (i === idx ? val : m)));
  }

  function addModel() {
    onChange([...models, '']);
  }

  function removeModel(idx: number) {
    onChange(models.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-medium text-gray-500">
          {models.length === 1 ? 'Model' : `Models (${models.length})`}
        </span>
        <button
          type="button"
          onClick={addModel}
          className="flex items-center gap-1 text-[0.6875rem] text-gray-500 bg-transparent border-none cursor-pointer transition-colors hover:text-blue-500"
        >
          <PlusCircle size={11} />
          add model
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {models.map((m, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="flex-1">
              <ModelCombobox value={m} onChange={(v) => updateModel(idx, v)} />
            </div>
            {models.length > 1 && (
              <button
                type="button"
                onClick={() => removeModel(idx)}
                className="w-5 h-5 flex items-center justify-center rounded text-gray-500 bg-transparent border-none cursor-pointer flex-shrink-0 transition-all hover:text-gray-900 hover:bg-slate-50"
              >
                <XCircle size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Modal
export function CreateVariationsModal({ imageId, onClose }: CreateVariationsModalProps) {
  const images = useCanvasStore((state) => state.images);
  const image = images.find((img) => img.id === imageId);

  const [basePrompt, setBasePrompt] = useState('Abstract modern art painting with bold geometric shapes and vibrant colors on gallery wall');
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION);
  const [count, setCount] = useState(3);
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 650));
    setPrompts(Array.from({ length: count }, (_, i) => makeEntry(`${basePrompt}, ${SUFFIXES[i % SUFFIXES.length]}`)));
    setGenerated(true);
    setGenerating(false);
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
      className="fixed inset-0 z-50 pointer-events-none"
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
              <h2 className="text-sm font-semibold text-gray-900 leading-none">Create Variations</h2>
              <p className="text-[0.625rem] text-gray-500 mt-0.5">Generate multiple variations of the image</p>
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
          {/* Step 1 */}
          <section>
            <div className="flex gap-4 rounded-xl border border-gray-200 bg-slate-50 p-4">
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20 shadow-md">
                  {image?.src ? (
                    <img src={image.src} alt="Base image" crossOrigin="anonymous" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                  <div className="absolute bottom-[-0.25rem] right-[-0.25rem] flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 border-2 border-white text-white text-[0.5rem] font-bold">
                    1
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label htmlFor="base-prompt" className="text-xs font-semibold text-gray-900">Base prompt</label>
                <textarea
                  id="base-prompt"
                  value={basePrompt}
                  onChange={(e) => setBasePrompt(e.target.value)}
                  rows={3}
                  className="flex-1 resize-none rounded-md border border-blue-400/40 bg-white px-2 py-2 text-xs text-gray-900 leading-relaxed outline-none focus:shadow-[0_0_0_1px_rgba(85,132,255,0.6)]"
                />
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 border border-gray-200 text-gray-500 text-[0.625rem] font-semibold">
                2
              </div>
              <span className="text-sm font-semibold text-gray-900">Configure variations</span>
            </div>

            <PromptInstructionInput value={instruction} basePrompt={basePrompt} onChange={setInstruction} />

            <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
              <CountSlider value={count} onChange={setCount} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !basePrompt.trim()}
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
                  3
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
                      <span className="text-xs font-medium text-gray-900">Variation {i + 1}</span>
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
                      rows={2}
                      className="w-full resize-none rounded-md border border-gray-200 bg-white px-2 py-2 text-xs text-gray-900 leading-relaxed outline-none focus:shadow-[0_0_0_1px_rgba(85,132,255,1)]"
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
                Add variation manually
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
              disabled={totalImages === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-500 border-none cursor-pointer transition-all hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Images size={13} />
              {totalImages > 0 ? `Generate ${totalImages} images` : 'Generate images'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
