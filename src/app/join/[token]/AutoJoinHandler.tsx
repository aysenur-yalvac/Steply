'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinProjectWithCode, ProjectInvitePreview } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Loader2, Users, School, FolderGit2, Check, X, AlertCircle } from 'lucide-react';

interface AutoJoinHandlerProps {
  token: string;
  initialPreview: ProjectInvitePreview | null;
  initialError?: string | null;
}

export default function AutoJoinHandler({
  token,
  initialPreview,
  initialError = null,
}: AutoJoinHandlerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError);
  const [isJoining, setIsJoining] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleConfirmJoin = async () => {
    if (isJoining || isDeclining) return;
    setIsJoining(true);
    try {
      const result = await joinProjectWithCode(token);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        setIsJoining(false);
      } else {
        toast.success('Projeye başarıyla katıldınız!');
        if (result.projectId) {
          router.push(`/dashboard/projects/${result.projectId}`);
        } else if (initialPreview?.projectId) {
          router.push(`/dashboard/projects/${initialPreview.projectId}`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Projeye katılırken bir hata oluştu.';
      setError(msg);
      toast.error(msg);
      setIsJoining(false);
    }
  };

  const handleDecline = () => {
    if (isJoining || isDeclining) return;
    setIsDeclining(true);
    toast('Proje daveti reddedildi.');
    router.push('/dashboard');
  };

  if (error || !initialPreview) {
    return (
      <div className="bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Davet Geçersiz</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          {error || 'Geçersiz veya süresi dolmuş davet bağlantısı.'}
        </p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl transition-colors font-semibold text-sm cursor-pointer"
        >
          Projelerime Dön
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
      {/* Üst Başlık */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner">
          <Users className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Proje Davetiyesi
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Bu projeye katılmak istiyor musunuz?
        </h1>
      </div>

      {/* Proje & Proje Sahibi Bilgi Kartı */}
      <div className="rounded-2xl bg-slate-50 dark:bg-[#0f1523] border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 shrink-0 mt-0.5">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Proje Adı
            </p>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">
              {initialPreview.title}
            </h2>
            {initialPreview.description ? (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                {initialPreview.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic mt-1">
                Proje açıklaması belirtilmemiş.
              </p>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center gap-3">
          {initialPreview.ownerAvatarUrl ? (
            <img
              src={initialPreview.ownerAvatarUrl}
              alt={initialPreview.ownerName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {(initialPreview.ownerName || 'P').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Proje Sahibi
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {initialPreview.ownerName}
            </p>
            {initialPreview.ownerSchool && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate mt-0.5">
                <School className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                <span className="truncate">{initialPreview.ownerSchool}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Onay / Red Butonları */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleDecline}
          disabled={isJoining || isDeclining}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Vazgeç / Reddet</span>
        </button>
        <button
          type="button"
          onClick={handleConfirmJoin}
          disabled={isJoining || isDeclining}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isJoining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Katılınıyor...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Projeye Katıl</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}