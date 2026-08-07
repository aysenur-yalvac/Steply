'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { Check } from 'lucide-react';
import { markProjectCompletedAction } from '@/lib/actions';

export default function CompleteProjectButton({ projectId, isCompletedInitial }: { projectId: string; isCompletedInitial: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(isCompletedInitial);

  const handleComplete = () => {
    startTransition(async () => {
      const result = await markProjectCompletedAction(projectId);
      if ('error' in result) {
        toast.error(result.error);
      } else {
        setIsCompleted(true);
        toast.success('Proje baÅŸarÄ±yla tamamlandÄ±!');
      }
    });
  };

  if (isCompleted) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700 text-sm font-semibold p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm w-full">
        <Check className="w-5 h-5 text-emerald-600" />
        Proje TamamlandÄ±
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      className={`mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold transition-all shadow-md ${isPending ? 'opacity-70 cursor-wait' : ''}`}
    >
      {isPending ? (
        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
      ) : (
        <Check className="w-5 h-5" strokeWidth={2.5} />
      )}
      {isPending ? 'TamamlanÄ±yor...' : 'Projeyi Bitir'}
    </button>
  );
}
