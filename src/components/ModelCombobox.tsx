import { useState, useRef } from 'react';
import { Search, Check, ChevronDown } from 'lucide-react';
import { useOutsideClick } from '../hooks/useOutsideClick';
import { MODELS, TAG_STYLES, DEFAULT_TAG_STYLE } from './modelConstants';

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
