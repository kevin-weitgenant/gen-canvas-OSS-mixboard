import { useState, useEffect } from "react";

const API_KEY_STORAGE_KEY = "kie_ai_api_key";

interface KeyFormProps {
  compact?: boolean;
  onSaved?: () => void;
}

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

export function clearApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function KeyForm({ compact = false, onSaved }: KeyFormProps) {
  const [key, setKey] = useState("");

  useEffect(() => {
    const savedKey = getApiKey();
    if (savedKey) {
      setKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    setApiKey(key);
    onSaved?.();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400/50 focus:shadow-[0_0_0_2px_rgba(85,132,255,0.3)] placeholder:text-slate-400"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#634994] text-white rounded-lg text-sm font-medium hover:bg-[#7a5aa8] transition-colors"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="sk-..."
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400/50 focus:shadow-[0_0_0_2px_rgba(85,132,255,0.3)] placeholder:text-slate-400"
      />
      <button
        onClick={handleSave}
        className="w-full px-4 py-2 bg-[#634994] text-white rounded-lg text-sm font-medium hover:bg-[#7a5aa8] transition-colors"
      >
        Save
      </button>
    </div>
  );
}
