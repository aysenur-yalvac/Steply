'use client'; 

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-red-500/20 shadow-2xl flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-white mb-4">Beklenmeyen Hata</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Bir şeyler yanlış gitti. Lütfen sayfayı yenilemeyi deneyin veya daha sonra tekrar dönün.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3.5 rounded-xl transition-all border border-slate-700"
          >
            <RefreshCcw className="w-5 h-5" /> Tekrar Dene
          </button>
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3.5 rounded-xl transition-all shadow-[0_0_20px_-5px_var(--color-indigo-500)]"
          >
            <Home className="w-5 h-5" /> Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
