"use client";

import { useState } from "react";
import { FolderUp, Trash2, FileText } from "lucide-react";
import { 
  restoreAssignmentAction, 
  permanentlyDeleteAssignmentAction,
  bulkRestoreAssignmentsAction,
  bulkPermanentDeleteAssignmentsAction
} from "@/lib/actions";
import type { Assignment } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function TrashAssignmentListClient({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(assignments.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} adet odevi geri yuklemek istediginize emin misiniz?`)) return;
    
    const res = await bulkRestoreAssignmentsAction(selectedIds);
    if (res.success) {
      setSelectedIds([]);
      router.refresh();
    } else {
      alert("Geri yukleme basarisiz: " + res.error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} adet odevi kalici olarak silmek istediginize emin misiniz? Bu islem geri alinamaz!`)) return;
    
    const res = await bulkPermanentDeleteAssignmentsAction(selectedIds);
    if (res.success) {
      setSelectedIds([]);
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

      {/* Bulk Actions Header */}
      {assignments.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl gap-4">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            <input 
              type="checkbox" 
              checked={selectedIds.length === assignments.length && assignments.length > 0}
              onChange={handleSelectAll}
              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 w-4 h-4 transition-colors"
            />
            Tumunu Sec ({selectedIds.length}/{assignments.length})
          </label>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBulkRestore}
                className="px-3 py-2 text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <FolderUp className="w-3.5 h-3.5" />
                Secilenleri Geri Yukle
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-3 py-2 text-xs font-semibold bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Secilenleri Kalici Sil
              </button>
            </div>
          )}
        </div>
      )}

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
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(assignment.id)}
                    onChange={() => toggleSelection(assignment.id)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 w-4 h-4 transition-colors shrink-0"
                  />
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
