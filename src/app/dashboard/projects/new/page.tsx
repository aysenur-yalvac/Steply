"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '../../actions';
import {
  Plus,
  ArrowLeft,
  Layout,
  AlignLeft,
  BarChart3,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewProjectPage() {
  const [isPending, setIsPending] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
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
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Plus className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Start New Project</h1>
              <p className="text-slate-500">Take the first step towards your goals now.</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl text-slate-900 rounded-[2rem] p-8 sm:p-12 w-full relative z-10">
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

            {/* İlerleme Durumu */}
            <div className="space-y-4">
              <div className="flex justify-between items-center ml-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <BarChart3 className="w-4 h-4 text-indigo-500" /> Initial Progress
                </label>
                <span className="text-xl font-bold text-indigo-500">%{progressPercentage}</span>
              </div>
              <div className="space-y-2">
                <input
                  name="progress_percentage"
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercentage}
                  onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 shadow-inner"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                  <span>START</span>
                  <span>HALF</span>
                  <span>COMPLETED</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
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
