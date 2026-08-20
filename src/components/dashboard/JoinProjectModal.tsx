'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Key, Loader2, ArrowRight } from 'lucide-react';
import { joinProjectWithCodeAction } from '@/app/dashboard/actions';
import toast from 'react-hot-toast';

interface JoinProjectModalProps {
  onClose: () => void;
}

export default function JoinProjectModal({ onClose }: JoinProjectModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    const result = await joinProjectWithCodeAction(cleanCode);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error || 'Katılım başarısız oldu.');
    } else {
      toast.success('Projeye başarıyla katıldınız!');
      if (result.projectId) {
        onClose();
        router.push(`/dashboard/projects/${result.projectId}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-indigo-500 dark:text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Projeye Katıl</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Ekip arkadaşından aldığın 6 haneli kodu gir ve projeye dahil ol.
          </p>

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="inviteCode" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Katılım Kodu</label>
              <input
                id="inviteCode"
                type="text"
                maxLength={6}
                placeholder="Örn: STP-XX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full uppercase tracking-widest text-lg font-bold px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={code.length < 4 || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Projeye Katıl
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
