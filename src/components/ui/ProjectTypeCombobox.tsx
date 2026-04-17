"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Plus, Tag } from "lucide-react";

interface Props {
  /** Pre-fetched top types from server */
  topTypes: string[];
  /** Initial / default value */
  defaultValue?: string;
  /** Form field name — must match what createProject reads */
  name?: string;
  placeholder?: string;
}

export default function ProjectTypeCombobox({
  topTypes,
  defaultValue = "",
  name = "platform",
  placeholder = "e.g.: Web App, Mobile App, REST API…",
}: Props) {
  const inputId               = useId();
  const [value,  setValue]    = useState(defaultValue);
  const [isOpen, setIsOpen]   = useState(false);
  const containerRef          = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  // ── Computed suggestion list ───────────────────────────────────────────────
  const q           = value.trim().toLowerCase();
  const suggestions = q
    ? topTypes.filter((t) => t.toLowerCase().includes(q))
    : topTypes;

  const exactMatch   = topTypes.some((t) => t.toLowerCase() === q);
  const showAddNew   = q.length > 0 && !exactMatch;

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const select = (type: string) => {
    setValue(type);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const addCustom = () => {
    const trimmed = value.trim();
    if (trimmed) {
      setValue(trimmed);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const hasDropdownContent = suggestions.length > 0 || showAddNew;

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden field carries the committed value for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Visible text input */}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          autoComplete="off"
          value={value}
          onChange={(e) => { setValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
            if (e.key === "Enter" && showAddNew) { e.preventDefault(); addCustom(); }
          }}
          placeholder={placeholder}
          className="w-full px-5 py-4 pr-12 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm"
        />
        <ChevronDown
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform duration-200 pointer-events-none ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* ── Dropdown ──────────────────────────────────────────────────────── */}
      {isOpen && hasDropdownContent && (
        <div
          className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          style={{ maxHeight: 280, overflowY: "auto" }}
        >
          {/* Suggested section */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {q ? "Matching Types" : "Suggested"}
              </div>
              {suggestions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => select(type)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors text-left"
                >
                  <Tag className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Divider before "Add new" */}
          {showAddNew && suggestions.length > 0 && (
            <div className="mx-4 border-t border-slate-100 my-1" />
          )}

          {/* "Add as new type" option */}
          {showAddNew && (
            <button
              type="button"
              onClick={addCustom}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center shrink-0">
                <Plus className="w-3.5 h-3.5 text-violet-600" />
              </div>
              Add &ldquo;{value.trim()}&rdquo; as new type
            </button>
          )}
        </div>
      )}
    </div>
  );
}
