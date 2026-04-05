import { PlusCircle, XCircle } from 'lucide-react';
import { ModelCombobox } from '../ModelCombobox';

interface ModelListProps {
  models: string[];
  onChange: (models: string[]) => void;
}

export function ModelList({ models, onChange }: ModelListProps) {
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
