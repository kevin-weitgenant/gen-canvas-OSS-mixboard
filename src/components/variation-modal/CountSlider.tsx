interface CountSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN_VARIATIONS = 1;
const MAX_VARIATIONS = 8;

export function CountSlider({ value, onChange }: CountSliderProps) {
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
