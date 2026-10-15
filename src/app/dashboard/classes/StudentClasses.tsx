'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { joinClassAction } from './actions';
import { LogIn, BookOpen, User, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StudentClasses({ initialMemberships }: { initialMemberships: any[] }) {
  const router = useRouter();
  const [memberships, setMemberships] = useState(initialMemberships);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sunucudan gelen initialMemberships güncellendiğinde senkronize et
  useEffect(() => {
    setMemberships(initialMemberships);
  }, [initialMemberships]);

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    try {
      const res = await joinClassAction(code);
      if (!res.success) {
        setError(res.error || "Sınıfa katılınamadı.");
        setLoading(false);
        return;
      }

      // 1. Yeni katıldığı sınıfı mevcut state listesine ANINDA ekle
      if (res.data) {
        setMemberships((prev) => [
          res.data,
          ...prev.filter((m: any) => m.classes?.id !== res.data.classes?.id),
        ]);
      }

      // 2. Başarı mesajını göster ve modalı kapat
      setSuccessMsg("Sınıfa başarıyla katıldınız!");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
        setLoading(false);
      }, 700);

      // 3. Arka planda sunucu önbelleğini yenile (tam sayfa yenilemesi olmadan)
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Beklenmeyen bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Sınıflarım</h1>
          <p className="text-slate-400 mt-1">Kayıtlı olduğunuz sınıflar.</p>
        </div>
        <button
          onClick={() => { setError(null); setSuccessMsg(null); setIsModalOpen(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md"
        >
          <LogIn className="w-5 h-5" />
          Sınıfa Katıl
        </button>
      </div>

      {memberships.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Henüz bir sınıfa katılmadınız</h3>
          <p className="text-slate-400 mb-6">Öğretmeninizin size ilettiği katılım koduyla bir sınıfa katılın.</p>
          <button
            onClick={() => { setError(null); setSuccessMsg(null); setIsModalOpen(true); }}
            className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-4 py-2 rounded-xl font-medium transition-all"
          >
            Sınıfa Katıl
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberships.map((membership) => {
            const cls = membership.classes;
            if (!cls) return null;
            return (
              <Link
                key={cls.id}
                href={`/dashboard/classes/${cls.id}`}
                className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-500/50 p-5 flex flex-col h-full relative overflow-hidden transition-all group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                <div className="flex-1 relative z-10">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{cls.name}</h3>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0 mt-1" />
                  </div>
                  {cls.description && <p className="text-slate-400 text-sm mb-4 line-clamp-2">{cls.description}</p>}

                  <div className="flex items-center gap-2 text-slate-300 mt-auto pt-4 border-t border-slate-800/80">
                    <User className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">{cls.profiles?.full_name || 'Öğretmen'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Sınıfa Katıl</h2>
            <p className="text-slate-400 text-sm mb-6">Öğretmeninizin size ilettiği katılım kodunu girin.</p>

            {successMsg ? (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Katılım Kodu</label>
                  <input
                    name="code"
                    required
                    placeholder="örn: STP-1234"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 uppercase tracking-widest font-mono transition-colors"
                  />
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setError(null); }}
                    className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-medium transition-all shadow-md"
                  >
                    {loading ? 'Katılınıyor...' : 'Katıl'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
