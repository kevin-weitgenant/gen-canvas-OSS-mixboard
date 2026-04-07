import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check, ChevronDown, Ban } from 'lucide-react';
import { MODELS, TAG_STYLES, DEFAULT_TAG_STYLE, ENABLED_MODEL } from './modelConstants';

interface ModelComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelCombobox({ value, onChange }: ModelComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = MODELS.find((m) => m.value === value);

  // Sort models: z-image first, then enabled, then disabled
  const sortedModels = [...MODELS].sort((a, b) => {
    if (a.value === 'z-image') return -1;
    if (b.value === 'z-image') return 1;
    const aEnabled = a.value === ENABLED_MODEL;
    const bEnabled = b.value === ENABLED_MODEL;
    if (aEnabled && !bEnabled) return -1;
    if (!aEnabled && bEnabled) return 1;
    return a.label.localeCompare(b.label);
  });

  const filtered = query.trim()
    ? sortedModels.filter((m) => m.label.toLowerCase().includes(query.toLowerCase()) || m.tag.toLowerCase().includes(query.toLowerCase()))
    : sortedModels;

  // Handle outside click - check both button and dropdown (for portal)
  useEffect(() => {
    if (!open) return;

    function handler(e: MouseEvent) {
      const target = e.target as Node;
      const outsideButton = buttonRef.current && !buttonRef.current.contains(target);
      const outsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);

      if (outsideButton && outsideDropdown) {
        setOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
    setQuery('');
  }

  function openDropdown() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const getTagStyle = (tag: string) => TAG_STYLES[tag] || DEFAULT_TAG_STYLE;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden z-[102]"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              minWidth: '220px',
            }}
          >
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
              {filtered.map((m) => {
                const isEnabled = m.value === ENABLED_MODEL;
                return (
                  <li
                    key={m.value}
                    role="option"
                    aria-selected={m.value === value}
                    aria-disabled={!isEnabled}
                    onClick={() => isEnabled && pick(m.value)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs transition-colors ${isEnabled ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed opacity-60'} ${m.value === value && isEnabled ? 'bg-blue-100' : isEnabled ? 'hover:bg-slate-50' : ''}`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate">{m.label}</span>
                      <span className={`flex-shrink-0 rounded-full px-1 py-0.5 text-[0.5625rem] font-medium leading-none border ${isEnabled ? getTagStyle(m.tag) : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                        {m.tag}
                      </span>
                    </span>
                    {m.value === value && isEnabled && <Check size={11} className="flex-shrink-0 text-blue-500" />}
                    {!isEnabled && <Ban size={11} className="flex-shrink-0 text-gray-400" />}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )
      }
    </div>
  );
}
