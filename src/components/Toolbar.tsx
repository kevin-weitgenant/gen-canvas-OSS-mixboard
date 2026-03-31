interface ToolbarProps {
  onClear: () => void;
}

export function Toolbar({ onClear }: ToolbarProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-white rounded-lg shadow-lg z-[100]">
      <button onClick={onClear} title="Clear Canvas" className="px-3 py-2 border border-gray-200 bg-white rounded cursor-pointer text-sm hover:bg-gray-100">
        🗑️ Clear
      </button>
    </div>
  );
}
