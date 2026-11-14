"use client";

import { useState } from "react";
import { X, Calendar, Type, AlignLeft, BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createAssignmentAction } from "@/lib/actions";

export default function CreateAssignmentModal({
  onClose,
  teacherClasses = [],
  defaultClassId,
}: {
  onClose: () => void;
  teacherClasses?: { id: string; name: string }[];
  defaultClassId?: string;
}) {
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("Genel");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [classId, setClassId] = useState(defaultClassId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const selectedClass = teacherClasses.find((c) => c.id === (defaultClassId || classId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError("Başlık ve Son Teslim Tarihi zorunludur.");
      return;
    }

    const targetClassId = defaultClassId || classId;
    if (!targetClassId) {
      setError("Lütfen ödevin atanacağı bir sınıf seçin.");
      return;
    }

    setLoading(true);
    setError(null);

    const isoDate = new Date(dueDate).toISOString();

    const res = await createAssignmentAction({
      title,
      description,
      course_name: courseName,
      due_date: isoDate,
      class_id: targetClassId,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Ödev oluşturulurken bir hata oluştu.");
      return;
    }

    onClose();
    router.refresh();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yeni Ödev Oluştur</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sınıfınız için yeni bir ödev ve teslim yönergesi yayınlayın
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-sm flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sol Kolon (md:col-span-2 - Geniş Alan) */}
              <div className="md:col-span-2 space-y-5">
                {/* Ödev Başlığı */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Type className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Ödev Başlığı <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: 2. Dönem Veri Tabanı Projesi ve Raporu"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Ödev Açıklaması */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Ödev Açıklaması ve Yönergeleri
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={10}
                    placeholder="Öğrencilerinizin ödevi tamamlarken izleyeceği adımları, teslim formatını ve değerlendirme kriterlerini buraya detaylıca yazabilirsiniz..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[250px] resize-y placeholder:text-slate-400 leading-relaxed font-normal"
                  />
                </div>
              </div>

              {/* Sağ Kolon (md:col-span-1 - Yan Panel) */}
              <div className="md:col-span-1 space-y-5">
                {/* Sınıf Bilgisi / Seçimi */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    Sınıf Bilgisi <span className="text-rose-500">*</span>
                  </label>

                  {defaultClassId ? (
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                      <span className="font-semibold text-purple-700 dark:text-purple-300 truncate">
                        {selectedClass?.name || "Seçili Sınıf"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        required
                      >
                        <option value="">-- Sınıf Seçin --</option>
                        {teacherClasses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {selectedClass && (
                        <div className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-800/40 truncate">
                          Seçilen: <strong>{selectedClass.name}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ders Adı */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Ders Adı
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Örn: Yazılım Mimarisi"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    required
                  />
                </div>

                {/* Son Teslim Tarihi ve Saati */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    Son Teslim Tarihi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>

                {/* Bilgilendirme Kartı */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Ödev Yayınlama Kuralları</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Öğrenciler son teslim tarihine kadar <strong>PDF, DOCX ve ZIP</strong> formatında ödevlerini yükleyebilirler. Belirtilen tarihten sonra sistem yeni teslim kabul etmeyecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yayınlanıyor...</span>
                </>
              ) : (
                <span>Ödevi Yayınla</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}