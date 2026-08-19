"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { updateProjectTagsAction } from "@/lib/actions";
import toast from "react-hot-toast";

const TAG_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-sky-100 text-sky-700 border-sky-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-amber-100 text-amber-700 border-amber-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-rose-100 text-rose-700 border-rose-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-indigo-100 text-indigo-700 border-indigo-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-teal-100 text-teal-700 border-teal-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-orange-100 text-orange-700 border-orange-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
];

function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

interface Props {
  projectId: string;
  initialTags: string[];
  canEdit: boolean;
}

export default function ProjectTags({ projectId, initialTags, canEdit }: Props) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [adding, setAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Render: show tags to all viewers; show edit controls only to canEdit users.
  // Only skip rendering entirely when there's genuinely nothing to display.
  const hasTags = tags.length > 0;
  if (!hasTags && !canEdit) return null;

  async function persist(next: string[]) {
    setSaving(true);
    const result = await updateProjectTagsAction(projectId, next);
    if ("error" in result) toast.error(result.error);
    setSaving(false);
  }

  function commitInput() {
    const val = inputValue.trim().toLowerCase();
    if (val && !tags.includes(val) && tags.length < 10) {
      const next = [...tags, val];
      setTags(next);
      persist(next);
    }
    setInputValue("");
    setAdding(false);
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    persist(next);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); commitInput(); }
    if (e.key === "Escape") { setInputValue(""); setAdding(false); }
    if (e.key === "," || e.key === " ") { e.preventDefault(); commitInput(); }
  }

  function startAdding() {
    setAdding(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Tags — visible to all viewers */}
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tagColor(tag)}`}
        >
          #{tag}
          {canEdit && (
            <button
              onClick={() => removeTag(tag)}
              disabled={saving}
              className="ml-0.5 rounded-full opacity-50 hover:opacity-100 transition-opacity disabled:opacity-30"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}

      {/* Add button — always visible for editors, even when tag list is empty */}
      {canEdit && !adding && tags.length < 10 && (
        <button
          onClick={startAdding}
          disabled={saving}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-dashed border-slate-300 text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-all disabled:opacity-40"
        >
          <Plus className="w-3 h-3" />
          Etiket Ekle
        </button>
      )}

      {canEdit && adding && (
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.slice(0, 32))}
          onKeyDown={handleKeyDown}
          onBlur={commitInput}
          placeholder="etiket…"
          maxLength={32}
          className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border border-violet-400 bg-violet-50 text-violet-700 outline-none w-28 placeholder-violet-300 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"
        />
      )}
    </div>
  );
}
