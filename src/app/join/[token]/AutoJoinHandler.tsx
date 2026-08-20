'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinProjectWithCode } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function AutoJoinHandler({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleJoin() {
      const result = await joinProjectWithCode(token);
      
      if (!mounted) return;

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        // Redirect to dashboard after a delay
        setTimeout(() => router.push('/dashboard'), 3000);
      } else {
        toast.success('Projeye başarıyla katıldınız!');
        if (result.projectId) {
          router.push(`/dashboard/projects/${result.projectId}`);
        } else {
          router.push('/dashboard');
        }
      }
    }

    handleJoin();

    return () => {
      mounted = false;
    };
  }, [token, router]);

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Katılım Başarısız</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl transition-colors font-medium"
        >
          Dashboard'a Dön
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-xl flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Projeye Katılınıyor...</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">Lütfen bekleyin, yönlendiriliyorsunuz.</p>
    </div>
  );
}