import { useState, useRef } from 'react';
import { Search, Check, ChevronDown } from 'lucide-react';
import { useOutsideClick } from '../hooks/useOutsideClick';

export interface Model {
  value: string;
  label: string;
  tag: string;
}

export const MODELS: Model[] = [
  { value: 'flux-dev', label: 'Flux Dev', tag: 'Open Source' },
  { value: 'flux-schnell', label: 'Flux Schnell', tag: 'Fast' },
  { value: 'flux-pro', label: 'Flux Pro', tag: 'Premium' },
  { value: 'sd-xl', label: 'Stable Diffusion XL', tag: 'Open Source' },
  { value: 'sd-3', label: 'Stable Diffusion 3', tag: 'Open Source' },
  { value: 'dalle-3', label: 'DALL·E 3', tag: 'OpenAI' },
  { value: 'imagen-3', label: 'Imagen 3', tag: 'Google' },
  { value: 'midjourney', label: 'Midjourney', tag: 'Premium' },
  { value: 'ideogram-v2', label: 'Ideogram v2', tag: 'Creative' },
  { value: 'recraft-v3', label: 'Recraft v3', tag: 'Design' },
];

const TAG_STYLES: Record<string, string> = {
  'Open Source': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fast': 'bg-amber-50 text-amber-700 border-amber-200',
  'Premium': 'bg-violet-50 text-violet-700 border-violet-200',
  'OpenAI': 'bg-blue-50 text-blue-700 border-blue-200',
  'Google': 'bg-sky-50 text-sky-700 border-sky-200',
  'Creative': 'bg-pink-50 text-pink-700 border-pink-200',
  'Design': 'bg-orange-50 text-orange-700 border-orange-200',
};

const DEFAULT_TAG_STYLE = 'bg-slate-100 text-slate-600 border-slate-200';

interface ModelComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelCombobox({ value, onChange }: ModelComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = MODELS.find((m) => m.value === value);

  const filtered = query.trim()
    ? MODELS.filter((m) => m.label.toLowerCase().includes(query.toLowerCase()) || m.tag.toLowerCase().includes(query.toLowerCase()))
    : MODELS;

  useOutsideClick(containerRef, () => {
    setOpen(false);
    setQuery('');
  }, open);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
    setQuery('');
  }

  function openDropdown() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const getTagStyle = (tag: string) => TAG_STYLES[tag] || DEFAULT_TAG_STYLE;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={openDropdown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center justify-between gap-2 w-full rounded-md border px-2.5 py-1.5 text-xs text-gray-900 cursor-pointer transition-all ${open ? 'border-blue-400 ring-1 ring-blue-300' : 'border-gray-200 hover:bg-slate-50'}`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="truncate">{selected?.label ?? 'Select model'}</span>
          {selected && (
            <span className={`flex-shrink-0 rounded-full px-1 py-0.5 text-[0.5625rem] font-medium leading-none border ${getTagStyle(selected.tag)}`}>
              {selected.tag}
            </span>
          )}
        </span>
        <ChevronDown size={11} className={`flex-shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.25rem)] z-50 w-full min-w-[220px] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gray-200 p-2">
            <Search size={11} className="flex-shrink-0 text-gray-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search model…"
              className="flex-1 bg-transparent text-xs text-gray-900 border-none outline-none placeholder:text-gray-500"
            />
          </div>

          <ul role="listbox" className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-2.5 py-1.5 text-xs text-gray-500">No results for "{query}"</li>
            )}
            {filtered.map((m) => (
              <li
                key={m.value}
                role="option"
                aria-selected={m.value === value}
                onClick={() => pick(m.value)}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs text-gray-900 cursor-pointer transition-colors ${m.value === value ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate">{m.label}</span>
                  <span className={`flex-shrink-0 rounded-full px-1 py-0.5 text-[0.5625rem] font-medium leading-none border ${getTagStyle(m.tag)}`}>
                    {m.tag}
                  </span>
                </span>
                {m.value === value && <Check size={11} className="flex-shrink-0 text-blue-500" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
