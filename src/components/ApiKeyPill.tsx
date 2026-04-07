import { useRef, useState, useEffect } from "react";
import { KeyRound, ExternalLink, Trash2 } from "lucide-react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { KeyForm, getApiKey, clearApiKey } from "./KeyForm";

export function ApiKeyPill() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useOutsideClick(popoverRef, () => setPopoverOpen(false), popoverOpen);

  useEffect(() => {
    const savedKey = getApiKey();
    setApiKey(savedKey || "");
  }, []);

  const hasKey = apiKey.length > 0;
  const maskedKey = hasKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "";

  const handleSaved = () => {
    setApiKey(getApiKey() || "");
    setPopoverOpen(false);
  };

  const handleClear = () => {
    clearApiKey();
    setApiKey("");
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setPopoverOpen((p) => !p)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-sm text-xs font-medium transition-all ${
          hasKey
            ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
            : "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 animate-pulse"
        }`}
      >
        <KeyRound size={13} />
        {hasKey ? maskedKey : "API Key"}
      </button>

      {popoverOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-900">API Key (BYOK)</p>
            {hasKey && (
              <button
                onClick={handleClear}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
          </div>

          <KeyForm compact onSaved={handleSaved} />

          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <p>
              <a
                href="https://kie.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#634994] hover:text-[#7a5aa8] font-medium inline-flex items-center gap-1"
              >
                Get your free API key here
                <ExternalLink size={10} />
              </a>
            </p>
            <p className="text-slate-500">
              Your key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
