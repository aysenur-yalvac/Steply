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
} from 'lucide-react';
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
  const router = useRouter();

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

    setIsPending(true);
    try {
      await createProject(formData);
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
      <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" variant="light" />
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Start New Project</h1>
            <p className="text-slate-500">Take the first step towards your goals now.</p>
          </div>
        </div>

        <div className="bg-white shadow-xl text-slate-900 rounded-[2rem] p-8 sm:p-10 w-full relative z-10">
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
                className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm"
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
                className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm resize-none"
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
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
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
                className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm"
              />
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
                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] active:scale-95"
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
