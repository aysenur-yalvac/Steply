"use client";

import React, { useState } from "react";
import { Flag, X, Loader2, ShieldAlert } from "lucide-react";
import { reportContentAction } from "@/lib/actions";
import toast from "react-hot-toast";

const REPORT_REASONS = [
  "Telif Hakkı İhlali",
  "Uygunsuz İçerik",
  "Spam / Yanıltıcı Bilgi",
  "Diğer",
] as const;

interface ReportContentButtonProps {
  targetType: "project" | "profile";
  targetId: string;
  targetTitle: string;
}

export default function ReportContentButton({
  targetType,
  targetId,
  targetTitle,
}: ReportContentButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await reportContentAction({
        targetType,
        targetId,
        targetTitle,
        reason,
        details,
      });
      if (res.success) {
        toast.success("Bildiriminiz yönetici incelemesine iletildi.");
        setOpen(false);
        setDetails("");
        setReason(REPORT_REASONS[0]);
      } else {
        toast.error(res.error || "Bildirim gönderilemedi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-100/80 hover:bg-rose-50 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 border border-slate-200/80 dark:border-slate-700/70 transition-colors"
        title="İçeriği veya telif ihlalini bildir"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>İçeriği Bildir</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#151b2b] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  İçeriği / İhlali Bildir
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bildirilen {targetType === "project" ? "Proje" : "Profil"}:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {targetTitle}
                  </span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Bildirim Nedeni
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-violet-500"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Açıklama <span className="font-normal text-slate-400">(isteğe bağlı)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="İhlal veya telif hakkı detayını kısaca açıklayın..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                5651 ve 5846 sayılı kanunlar kapsamındaki resmî telif ve içerik kaldırma taleplerinizi{" "}
                <a
                  href="mailto:abuse@must-b.com"
                  className="font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  abuse@must-b.com
                </a>{" "}
                adresine de iletebilirsiniz.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Bildirimi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
