'use client';

import React, { useState } from 'react';
import { Key, ArrowRight, Loader2 } from 'lucide-react';
import { joinProjectWithCode } from '@/lib/actions';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function JoinByCodeInput() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const joinToken = searchParams?.get('join');
    if (joinToken) {
      const autoJoin = async () => {
        setIsLoading(true);
        const result = await joinProjectWithCode(joinToken);
        setIsLoading(false);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Davet bağlantısı ile projeye katıldınız!');
          if (result.projectId) {
            router.push(`/dashboard/projects/${result.projectId}`);
          }
        }
      };
      autoJoin();
    }
  }, [searchParams, router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    const result = await joinProjectWithCode(cleanCode);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Projeye başarıyla katıldınız!');
      setCode('');
      if (result.projectId) {
        router.push(`/dashboard/projects/${result.projectId}`);
      }
    }
  };

  return (
    <form onSubmit={handleJoin} className="bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 mb-6 shadow-sm">
      <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
        <Key className="w-5 h-5 text-indigo-500 dark:text-slate-200" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Koda Sahip misin?</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Ekip arkadaşından aldığın 6 haneli kodu gir ve projeye katıl.</p>
      </div>
      <div className="flex w-full sm:w-auto relative">
        <input 
          type="text" 
          maxLength={6}
          placeholder="STP-XX" 
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full sm:w-40 uppercase tracking-widest text-sm font-bold pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
        />
        <button 
          type="submit" 
          disabled={code.length < 4 || isLoading}
          className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
}
