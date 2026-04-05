import { useEffect, useRef } from 'react';

interface AutoGrowingTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minRows?: number;
  maxRows?: number;
}

export function AutoGrowingTextarea({
  value,
  onChange,
  className = '',
  minRows = 3,
  maxRows = 10
}: AutoGrowingTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, maxRows * 24); // ~24px per row
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, maxRows]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={minRows}
      style={{ minHeight: `${minRows * 24}px`, maxHeight: `${maxRows * 24}px`, overflowY: 'auto' }}
      className={className}
    />
  );
}
