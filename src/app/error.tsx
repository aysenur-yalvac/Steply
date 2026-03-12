'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCcw, BookOpen } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex flex-col items-center max-w-lg">
        <div className="flex items-center gap-2 mb-12">
          <BookOpen className="w-10 h-10 text-red-500" />
          <span className="font-bold text-3xl tracking-tight text-slate-900 dark:text-white">Steply</span>
        </div>

        <div className="p-6 rounded-full bg-red-500/10 text-red-500 mb-8 border border-red-500/20">
          <AlertCircle className="w-16 h-16" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
          An Unexpected Error Occurred
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">
          A temporary glitch occurred in the system. Our engineers might be working on the issue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-all hover:opacity-90 active:scale-95 shadow-xl"
          >
            <RefreshCcw className="w-5 h-5" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] active:scale-95"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left overflow-auto max-w-full">
            <p className="text-xs font-mono text-red-500 mb-2 font-bold uppercase tracking-wider">Developer Note:</p>
            <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-[10px] text-slate-400 mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
