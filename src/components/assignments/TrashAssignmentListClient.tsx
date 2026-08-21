"use client";

import { useState } from "react";
import { FolderUp, Trash2, FileText } from "lucide-react";
import { restoreAssignmentAction, permanentlyDeleteAssignmentAction } from "@/lib/actions";
import type { Assignment } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function TrashAssignmentListClient({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const router = useRouter();

  const handleRestore = async (id: string) => {
    const res = await restoreAssignmentAction(id);
    if (res.success) {
      router.refresh();
    } else {
      alert("Geri yukleme basarisiz: " + res.error);
    }
  };

  const handlePermDelete = async (id: string) => {
    if (!confirm("Bu odevi kalici olarak silmek istediginize emin misiniz? Bu islem geri alinamaz!")) return;
    const res = await permanentlyDeleteAssignmentAction(id);
    if (res.success) {
      router.refresh();
    } else {
      alert("Silme basarisiz: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Silinen Odevler</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Cop kutusundaki odevleri geri yukleyebilir veya kalici olarak silebilirsiniz.</p>
      </div>

      {/* List */}
      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Trash2 className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Cop kutusu bos</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-sm">
            Silinmis herhangi bir odev bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map((assignment) => {
            return (
              <div 
                key={assignment.id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                      {assignment.description || "Aciklama bulunmuyor."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800 shrink-0">
                  <button
                    onClick={() => handleRestore(assignment.id)}
                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FolderUp className="w-4 h-4" />
                    Geri Yukle
                  </button>
                  <button
                    onClick={() => handlePermDelete(assignment.id)}
                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Kalici Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
