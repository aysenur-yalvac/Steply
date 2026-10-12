'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClassAction } from "./actions";
import { Plus, Users, Copy, Check, BookOpen, ChevronRight, AlertCircle } from "lucide-react";

export default function TeacherClasses({ initialClasses }: { initialClasses: any[] }) {
  const router = useRouter();
  const [classes, setClasses] = useState(initialClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await createClassAction(formData);
      if (!res.success) {
        setError(res.error || "Sınıf oluşturulurken bir hata oluştu.");
        setLoading(false);
        return;
      }
      if (res.data) {
        setClasses(prev => [{ ...res.data, class_members: [{ count: 0 }] }, ...prev]);
      }
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (e: React.MouseEvent, id: string, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Sınıflarım</h1>
          <p className="text-slate-400 mt-1">Öğrencileriniz için sınıflar oluşturun ve yönetin.</p>
        </div>
        <button
          onClick={() => { setError(null); setIsModalOpen(true); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Yeni Sınıf Oluştur
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Henüz sınıfınız yok</h3>
          <p className="text-slate-400 mb-6">Öğrencilerinizi davet etmek için ilk sınıfınızı oluşturun.</p>
          <button
            onClick={() => { setError(null); setIsModalOpen(true); }}
            className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-4 py-2 rounded-xl font-medium transition-all"
          >
            Sınıf Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Link
              href={`/dashboard/classes/${cls.id}`}
              key={cls.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-500/50 p-5 flex flex-col h-full transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{cls.name}</h3>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0 mt-1" />
                </div>
                {cls.description && <p className="text-slate-400 text-sm mb-4 line-clamp-2">{cls.description}</p>}

                <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 w-max px-3 py-1.5 rounded-lg mb-4">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">{cls.class_members?.[0]?.count || 0} Öğrenci</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Katılım Kodu</p>
                  <p className="font-mono font-bold text-purple-300">{cls.code}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => copyToClipboard(e, cls.id, cls.code)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Kodu Kopyala"
                >
                  {copiedId === cls.id ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Yeni Sınıf</h2>
            <p className="text-slate-400 text-sm mb-6">Öğrencilerinize vermek için bir sınıf oluşturun.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sınıf Adı</label>
                <input
                  name="name"
                  required
                  placeholder="örn: 10-A Web Geliştirme"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Açıklama (Opsiyonel)</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Sınıf hakkında kısa bilgi..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                ></textarea>
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-medium transition-all shadow-md"
                >
                  {loading ? "Oluşturuluyor..." : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
