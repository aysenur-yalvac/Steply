"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '../../actions';
import {
  Plus,
  Layout,
  AlignLeft,
  BarChart3,
  Loader2,
  Flag,
  Monitor,
  Tag,
  X,
} from 'lucide-react';

const TAG_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-orange-100 text-orange-700 border-orange-200",
];
function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}
import { BackButton } from '@/components/ui/back-button';

import toast from 'react-hot-toast';

type Priority = 'Low' | 'Medium' | 'High';

const PRIORITIES: { value: Priority; activeClass: string }[] = [
  { value: 'Low',    activeClass: 'bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4)]' },
  { value: 'Medium', activeClass: 'bg-orange-500  border-orange-500  text-white shadow-[0_4px_12px_-2px_rgba(249,115,22,0.4)]'  },
  { value: 'High',   activeClass: 'bg-red-500     border-red-500     text-white shadow-[0_4px_12px_-2px_rgba(239,68,68,0.4)]'   },
];

export default function NewProjectPage() {
  const [isPending, setIsPending] = useState(false);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const router = useRouter();

  function commitTag(raw: string) {
    const val = raw.trim().toLowerCase().slice(0, 32);
    if (val && !tags.includes(val) && tags.length < 10) setTags(t => [...t, val]);
    setTagInput('');
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      commitTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(t => t.slice(0, -1));
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const title = (formData.get('title') as string)?.trim();
    if (!title) {
      toast.error('Project title is required.');
      return;
    }

    // Ensure client-controlled fields are always present — use exact state value, no override
    formData.set('priority', priority);
    if (!formData.get('platform')) {
      formData.set('platform', 'General');
    }
    formData.set('progress_percentage', '0');
    formData.set('tags', JSON.stringify(tags));

    setIsPending(true);
    try {
      const result = await createProject(formData);
      if (!result.success) {
        toast.error(result.error || 'An error occurred');
        return;
      }
      toast.success('Project created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-6 sm:p-10 flex flex-col items-center justify-center">
      <div className="w-full  max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" variant="light" />
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Start New Project</h1>
            <p className="text-slate-500 dark:text-slate-400">Take the first step towards your goals now.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl dark:text-slate-100 dark:border-slate-800 shadow-xl text-slate-900 dark:text-slate-100 rounded-[2rem] p-8 sm:p-10 w-full relative z-10">
          <form action={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <Layout className="w-4 h-4 text-indigo-500" /> Project Title
              </label>
              <input
                name="title"
                type="text"
                placeholder="e.g.: Mobile App Development"
                required
                className="w-full  px-5 py-4 rounded-2xl bg-white dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl dark:text-slate-100 dark:border-slate-800 border border-slate-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <AlignLeft className="w-4 h-4 text-indigo-500" /> Details
              </label>
              <textarea
                name="description"
                placeholder="Describe the purpose and goals of the project briefly..."
                rows={4}
                className="w-full  px-5 py-4 rounded-2xl bg-white dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl dark:text-slate-100 dark:border-slate-800 border border-slate-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm resize-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
              />
            </div>

            {/* Priority */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <Flag className="w-4 h-4 text-indigo-500" /> Proje Önceliği
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map(({ value, activeClass }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriority(value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      priority === value
                        ? activeClass
                        : 'bg-white dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl dark:text-slate-100 dark:border-slate-800 border-slate-200 text-slate-500 dark:text-slate-400 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform (free text) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <Monitor className="w-4 h-4 text-indigo-500" /> Proje Tipi
              </label>
              <input
                name="platform"
                type="text"
                placeholder="e.g.: React Native, Next.js, REST API..."
                className="w-full  px-5 py-4 rounded-2xl bg-white dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl dark:text-slate-100 dark:border-slate-800 border border-slate-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <Tag className="w-4 h-4 text-indigo-500" /> Etiketler <span className="text-slate-400 font-normal">(isteğe bağlı)</span>
              </label>
              <div
                className="w-full  min-h-[52px] px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl dark:text-slate-100 dark:border-slate-800 border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-300 transition-all flex flex-wrap gap-1.5 items-center shadow-sm cursor-text dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
                onClick={() => document.getElementById('tag-input')?.focus()}
              >
                {tags.map(tag => (
                  <span key={tag} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tagColor(tag)}`}>
                    #{tag}
                    <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} className="opacity-60 hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length < 10 && (
                  <input
                    id="tag-input"
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value.slice(0, 32))}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => { if (tagInput) commitTag(tagInput); }}
                    placeholder={tags.length === 0 ? "nextjs, react, api… (virgül veya Enter ile ekle)" : ""}
                    className="flex-1 min-w-[140px] outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-transparent py-0.5"
                  />
                )}
              </div>
              <p className="text-xs text-slate-400 ml-1">Virgül, boşluk veya Enter ile ayırın. Maksimum 10 etiket.</p>
            </div>

            {/* Progress — auto-calculated */}
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-600 leading-snug">
                <span className="font-semibold">Progress is calculated automatically</span> based on completed milestones. You can add milestones after creating the project.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full  flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 dark:text-slate-400 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] active:scale-95 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
