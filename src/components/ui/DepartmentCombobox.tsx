"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { BookOpen, X, ChevronDown } from "lucide-react";
import { TURKISH_DEPARTMENTS, searchTurkishDepartments } from "@/data/turkishDepartments";

interface DepartmentComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export default function DepartmentCombobox({
  value,
  onChange,
  placeholder = "Bölüm ara ve seç...",
  disabled = false,
  className = "",
  name,
}: DepartmentComboboxProps) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const filtered = useMemo(() => {
    if (!query.trim()) return TURKISH_DEPARTMENTS.slice(0, 60);
    return searchTurkishDepartments(query, 60);
  }, [query]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    onChange(q);
    setOpen(true);
    setHighlighted(-1);
  }

  function handleSelect(dept: string) {
    setQuery(dept);
    onChange(dept);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleClear() {
    setQuery("");
    onChange("");
    setOpen(true);
    inputRef.current?.focus();
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0 && filtered[highlighted]) {
      e.preventDefault();
      handleSelect(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputCls =
    "w-full pl-9 pr-9 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 outline-none transition-all text-sm disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={query} />}
      <div className="relative">
        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={inputCls}
        />
        {!disabled && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-300 hover:text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="text-slate-300 hover:text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {open && !disabled && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-black/60 overflow-hidden max-h-60 overflow-y-auto">
          {filtered.map((dept, i) => (
            <button
              key={dept}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(dept);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                highlighted === i
                  ? "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-sm font-medium truncate">{dept}</span>
            </button>
          ))}
        </div>
      )}

      {open && !disabled && filtered.length === 0 && query.trim().length >= 1 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg px-4 py-3 text-xs text-slate-400">
          &ldquo;{query}&rdquo; ile eşleşen bölüm bulunamadı.
        </div>
      )}
    </div>
  );
}
