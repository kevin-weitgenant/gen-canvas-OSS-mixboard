import { ArrowRight, Plus } from "lucide-react";

export function PromptBar() {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3">
      {/* Plus Button */}
      <button className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50 transition-colors">
        <Plus className="w-5 h-5" />
      </button>

      {/* Input Pill */}
      <div className="relative flex items-center w-[400px] sm:w-[500px] h-12 bg-white rounded-full border border-slate-200 shadow-sm">
        <input 
          type="text" 
          placeholder="What do you want to create?" 
          className="w-full h-full bg-transparent pl-5 pr-14 rounded-full outline-none text-slate-700 placeholder-[#8A8F9E] font-medium text-[15px]"
        />
        
        <button className="absolute right-1.5 flex items-center justify-center w-9 h-9 rounded-full bg-[#E5DDF5] text-[#634994] hover:bg-[#DACCEE] transition-colors">
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
