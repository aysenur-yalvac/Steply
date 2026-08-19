"use client";

import { useState } from "react";
import { restoreProjectAction, permanentDeleteProjectAction, bulkRestoreProjectsAction, bulkPermanentDeleteProjectsAction } from "@/lib/actions";
import ProjectCard from "@/app/dashboard/ProjectCard";
import EmptyState from "@/components/layout/EmptyState";
import { Trash2, Loader2, CheckSquare, Square, Trash } from "lucide-react";
import toast from "react-hot-toast";

export default function TrashProjectsClient({ initialProjects, currentUserId }: { initialProjects: any[], currentUserId: string }) {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: "restore" | "delete"; isBulk: boolean; targetId?: string } | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(projects.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  
  const handleAction = async () => {
    if (!modalState) return;
    setIsProcessing(true);
    
    // Optimistic UI update
    let idsToRemove: string[] = [];
    if (modalState.isBulk) {
      idsToRemove = selectedIds;
    } else if (modalState.targetId) {
      idsToRemove = [modalState.targetId];
    }
    
    setProjects(prev => prev.filter(p => !idsToRemove.includes(p.id)));
    setModalState(null); // Close modal immediately
    
    try {
      if (modalState.isBulk) {
        if (modalState.type === "restore") {
          await bulkRestoreProjectsAction(selectedIds);
          toast.success("Seçilen projeler geri yüklendi!");
        } else {
          await bulkPermanentDeleteProjectsAction(selectedIds);
          toast.success("Seçilen projeler kalıcı olarak silindi!");
        }
        setSelectedIds([]);
      } else if (modalState.targetId) {
        if (modalState.type === "restore") {
          await restoreProjectAction(modalState.targetId);
          toast.success("Proje geri yüklendi!");
        } else {
          await permanentDeleteProjectAction(modalState.targetId);
          toast.success("Proje kalıcı olarak silindi!");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu");
      // Revert optimistic update on error by triggering a server revalidate or just letting the user refresh
    } finally {
      setIsProcessing(false);
    }
  };


  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Trash2}
        title="Çöp kutusu boş"
        description="Silinmiş projeniz bulunmuyor."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toplu İşlem Barı */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:text-slate-100 transition-colors">
          {selectedIds.length === projects.length && projects.length > 0 ? (
            <CheckSquare className="w-5 h-5 text-violet-600" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
          Tümünü Seç ({selectedIds.length}/{projects.length})
        </button>
        <div className="flex items-center gap-3">
          <button
            disabled={selectedIds.length === 0}
            onClick={() => setModalState({ isOpen: true, type: "restore", isBulk: true })}
            className="px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Seçilenleri Geri Yükle
          </button>
          <button
            disabled={selectedIds.length === 0}
            onClick={() => setModalState({ isOpen: true, type: "delete", isBulk: true })}
            className="px-4 py-2 bg-red-50 text-red-600 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Seçilenleri Kalıcı Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project: any) => (
          <div key={project.id} className={`relative group rounded-2xl border-2 transition-all ${selectedIds.includes(project.id) ? 'border-violet-500' : 'border-transparent'}`}>
            {/* Checkbox Overlay */}
            <div className="absolute top-3 left-3 z-20">
              <button onClick={() => toggleSelect(project.id)} className="bg-white dark:bg-slate-900/80 backdrop-blur-sm p-1 rounded-md shadow-sm">
                {selectedIds.includes(project.id) ? (
                  <CheckSquare className="w-5 h-5 text-violet-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>

            <div className="pointer-events-none opacity-50">
              <ProjectCard project={project} currentUserId={currentUserId} />
            </div>
            
            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl z-10">
              <button
                onClick={() => setModalState({ isOpen: true, type: "restore", isBulk: false, targetId: project.id })}
                className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 dark:text-slate-100 rounded-xl font-medium shadow-sm hover:shadow-md transition-all text-sm w-36"
              >
                Geri Yükle
              </button>
              <button
                onClick={() => setModalState({ isOpen: true, type: "delete", isBulk: false, targetId: project.id })}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium shadow-sm hover:bg-red-700 transition-all text-sm w-36"
              >
                Kalıcı Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalState?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-slate-100 mb-2">
              {modalState.type === "restore" ? "Geri Yükle" : "Kalıcı Olarak Sil"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {modalState.isBulk 
                ? `Seçilen ${selectedIds.length} öğeyi ${modalState.type === "restore" ? "geri yüklemek" : "kalıcı olarak silmek"} istediğinize emin misiniz?`
                : `Bu projeyi ${modalState.type === "restore" ? "geri yüklemek" : "kalıcı olarak silmek"} istediğinize emin misiniz?`}
              {modalState.type === "delete" && " Bu işlem geri alınamaz."}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setModalState(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 dark:text-slate-100 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleAction}
                disabled={isProcessing}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2 ${modalState.type === "restore" ? "bg-violet-600 hover:bg-violet-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isProcessing ? "İşleniyor..." : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
