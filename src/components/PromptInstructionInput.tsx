import { useState, useRef } from 'react';
import { useOutsideClick } from '../hooks/useOutsideClick';

const TOKEN = '{prompt base}';

interface TooltipTokenProps {
  basePrompt: string;
}

function TooltipToken({ basePrompt }: TooltipTokenProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useOutsideClick(ref, () => setOpen(false), open);

  return (
    <span
      ref={ref}
      className="relative inline-block cursor-pointer select-none"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      role="button"
      aria-label={`prompt base: ${basePrompt}`}
    >
      <span className="inline-block rounded-full px-2 py-0.5 text-[0.85em] font-semibold bg-blue-500 text-white shadow-sm transition-opacity hover:opacity-80">
        {TOKEN}
      </span>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 leading-relaxed shadow-xl pointer-events-none"
        >
          <span className="block text-[0.625rem] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Base prompt
          </span>
          {basePrompt || <span className="italic text-gray-500">Empty — write a base prompt above</span>}
        </span>
      )}
    </span>
  );
}

interface TokenizedTextProps {
  text: string;
  basePrompt?: string;
}

function TokenizedText({ text, basePrompt }: TokenizedTextProps) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <TooltipToken basePrompt={basePrompt} />}
        </span>
      ))}
    </>
  );
}

interface PromptInstructionInputProps {
  value: string;
  basePrompt?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function PromptInstructionInput({ value, basePrompt, onChange, placeholder = 'Click to write an instruction…', label }: PromptInstructionInputProps) {
  const [focused, setFocused] = useState<boolean>(false);
  const hasToken = basePrompt !== undefined && value.includes(TOKEN);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <label className="text-xs font-semibold text-gray-900">{label ?? (basePrompt !== undefined ? 'Variation instruction' : 'Prompt instruction')}</label>
        {basePrompt !== undefined ? (
          <span className="text-[0.6875rem] text-gray-500 leading-relaxed text-right max-w-[280px]">
            Modify the <code className="rounded-full bg-blue-100 px-1 py-0.5 text-blue-600 font-mono text-[0.625rem] border border-blue-200">{TOKEN}</code> or write from scratch — free field
          </span>
        ) : null}
      </div>

      {focused ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setFocused(false)}
          rows={3}
          placeholder={`Ex: "Reinterpret ${TOKEN} in art deco style" or "A mountain landscape at sunset"`}
          className="w-full min-h-20 resize-none rounded-lg border border-blue-400/40 bg-white px-3.5 py-3.5 text-sm text-gray-900 leading-relaxed outline-none shadow-[0_0_0_2px_rgba(85,132,255,0.3)] font-mono placeholder:font-sans placeholder:text-xs placeholder:text-gray-500"
        />
      ) : (
        <div
          onClick={() => setFocused(true)}
          role="textbox"
          aria-multiline="true"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          className="w-full min-h-20 cursor-pointer rounded-lg border border-gray-200 bg-white px-3.5 py-3.5 text-sm text-gray-900 leading-relaxed outline-none transition-colors hover:border-blue-300"
        >
          {value ? (
            hasToken ? (
              <TokenizedText text={value} basePrompt={basePrompt} />
            ) : (
              value
            )
          ) : (
            <span className="italic text-gray-500 text-xs">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
}
