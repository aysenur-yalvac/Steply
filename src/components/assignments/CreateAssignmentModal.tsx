"use client";

import { useState } from "react";
import { X, Calendar, Type, AlignLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { createAssignmentAction } from "@/lib/actions";

export default function CreateAssignmentModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [courseName, setCourseName] = useState("Genel");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
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

    const res = await createAssignmentAction({
      title,
      description,
      course_name: courseName,
      due_date: isoDate,
    });

    setLoading(false);

    if (!res.success) {
      alert(`VERITABANI HATASI: ${res.error}`);
      return;
    }

    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">Yeni Odev Olustur</h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

                    <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Ders Adi
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Orn: Yazilim Mimarisi"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-400" />
              Odev Basligi
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Orn: Algoritma Projesi"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-indigo-400" />
              Aciklama (Opsiyonel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Odevin detaylari ve gereksinimleri..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Son Teslim Tarihi ve Saati
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
              {loading ? "Olusturuluyor..." : "Odevi Olustur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
