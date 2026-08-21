"use client";

import { useState } from "react";
import { X, Calendar, Type, AlignLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateAssignmentAction } from "@/lib/actions";
import type { Assignment } from "@/lib/actions";

export default function EditAssignmentModal({ 
  assignment, 
  onClose 
}: { 
  assignment: Assignment;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(assignment.title);
  const [courseName, setCourseName] = useState(assignment.course_name || "Genel");
  const [grade, setGrade] = useState(assignment.grade || "Tumu");
  const [description, setDescription] = useState(assignment.description || "");
  
  // Convert ISO string to format accepted by datetime-local (YYYY-MM-DDThh:mm)
  const formatDatetimeLocal = (isoString: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    // Adjust for local timezone offset
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [dueDate, setDueDate] = useState(formatDatetimeLocal(assignment.due_date));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError("Baslik ve Son Teslim Tarihi zorunludur.");
      return;
    }

    setLoading(true);
    setError(null);
    
    const isoDate = new Date(dueDate).toISOString();

    const res = await updateAssignmentAction(assignment.id, {
      title,
      description,
      course_name: courseName,
      grade: grade,
      due_date: isoDate,
    });

    setLoading(false);

    if (!res.success) {
      alert(`GUNCELLEME HATASI: ${res.error}`);
      return;
    }

    onClose();
    router.refresh(); // Or window.location.reload()
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Odevi Duzenle</h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Ders Adi
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Orn: Yazilim Mimarisi"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
            
            <div className="space-y-2 flex-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                Sinif / Duzey
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="Tumu">Tumu</option>
                <option value="1. Sinif">1. Sinif</option>
                <option value="2. Sinif">2. Sinif</option>
                <option value="3. Sinif">3. Sinif</option>
                <option value="4. Sinif">4. Sinif</option>
                <option value="Yuksek Lisans / Doktora">Yuksek Lisans / Doktora</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Odev Basligi
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Orn: Algoritma Projesi"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Aciklama (Opsiyonel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Odevin detaylari ve gereksinimleri..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Son Teslim Tarihi ve Saati
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl p-3 scheme-light dark:scheme-dark focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
            <p className="text-xs text-slate-500">
              Bu tarihten sonra ogrenciler dosya yukleyemeyecektir.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Degisiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
