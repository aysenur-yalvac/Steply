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
    const result = await createProject(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsPending(false);
    } else {
      toast.success('Proje başarıyla oluşturuldu!');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Yeni Proje Başlat</h1>
            <p className="text-slate-500 dark:text-slate-400">Hedeflerine giden ilk adımı şimdi at.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-md">
        <form action={handleSubmit} className="space-y-6">
          {/* Proje Başlığı */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
              <Layout className="w-4 h-4 text-indigo-500" /> Proje Başlığı
            </label>
            <input
              name="title"
              type="text"
              placeholder="Örn: Mobil Uygulama Geliştirme"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
              <AlignLeft className="w-4 h-4 text-indigo-500" /> Detaylar
            </label>
            <textarea
              name="description"
              placeholder="Projenin amacını ve hedeflerini kısaca anlat..."
              rows={4}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* İlerleme Durumu */}
          <div className="space-y-4">
            <div className="flex justify-between items-center ml-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Başlangıç İlerlemesi
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
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                <span>BAŞLANGIÇ</span>
                <span>YARISI</span>
                <span>TAMAMLANDI</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] active:scale-95"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Hazırlanıyor...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Projeyi Oluştur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
