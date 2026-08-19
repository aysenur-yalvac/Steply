"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GraduationCap, Search, X, Loader2, ChevronDown } from "lucide-react";
import { searchUniversitiesAction } from "@/lib/actions";
import toast from "react-hot-toast";

interface UniversityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function UniversityCombobox({
  value,
  onChange,
  placeholder = "Üniversite ara...",
  className = "",
}: UniversityComboboxProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<{ name: string; country: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input in sync with external value resets
  useEffect(() => { setQuery(value); }, [value]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const { results: data, error } = await searchUniversitiesAction(q);
      if (error) toast.error(`Üniversite araması başarısız: ${error}`);
      setResults(data);
      setOpen(data.length > 0);
      setHighlighted(-1);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    onChange(q); // live update so parent has partial value
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
  }

  function handleSelect(uni: { name: string; country: string }) {
    setQuery(uni.name);
    onChange(uni.name);
    setOpen(false);
    setResults([]);
    inputRef.current?.blur();
  }

  function handleClear() {
    setQuery("");
    onChange("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  // Click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      handleSelect(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputCls =
    "w-full pl-9 pr-9 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 dark:text-slate-200 focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 outline-none transition-all text-sm";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          className={inputCls}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />}
          {!loading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-300 hover:text-slate-500 dark:text-slate-400 transition-colors"
              tabIndex={-1}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {!loading && !query && (
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden max-h-64 overflow-y-auto">
          {results.map((uni, i) => (
            <button
              key={`${uni.name}-${i}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(uni); }}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                highlighted === i ? "bg-violet-50" : "hover:bg-slate-50"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${highlighted === i ? "text-violet-700" : "text-slate-800 dark:text-slate-200"}`}>
                  {uni.name}
                </p>
                <p className="text-[11px] text-slate-400">{uni.country}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>"{query}" için sonuç bulunamadı.</span>
          </div>
        </div>
      )}
    </div>
  );
}
