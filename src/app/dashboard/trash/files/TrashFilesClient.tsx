"use client";

import { useState } from "react";
import { restoreFileAction, permanentDeleteFileAction, bulkRestoreFilesAction, bulkPermanentDeleteFilesAction } from "@/lib/actions";
import EmptyState from "@/components/layout/EmptyState";
import { Trash2, FileIcon, Loader2, CheckSquare, Square, Trash } from "lucide-react";
import toast from "react-hot-toast";

export default function TrashFilesClient({ initialFiles }: { initialFiles: any[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: "restore" | "delete"; isBulk: boolean; targetFile?: any } | null>(null);

  const toggleSelectAll = () => {
    if (selectedKeys.length === files.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(files.map(f => `${f.projectId}::${f.url}`));
    }
  };

  const toggleSelect = (file: any) => {
    const key = `${file.projectId}::${file.url}`;
    setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  
  const handleAction = async () => {
    if (!modalState) return;
    setIsProcessing(true);

    // Optimistic UI update
    let keysToRemove: string[] = [];
    if (modalState.isBulk) {
      keysToRemove = selectedKeys;
    } else if (modalState.targetFile) {
      keysToRemove = [`${modalState.targetFile.projectId}::${modalState.targetFile.url}`];
    }

    setFiles(prev => prev.filter(f => !keysToRemove.includes(`${f.projectId}::${f.url}`)));
    setModalState(null); // Close modal immediately

    try {
      if (modalState.isBulk) {
        const payload = selectedKeys.map(k => {
          const [projectId, url] = k.split("::");
          return { projectId, url };
        });
        if (modalState.type === "restore") {
          await bulkRestoreFilesAction(payload);
          toast.success("Seçilen dosyalar geri yüklendi!");
        } else {
          await bulkPermanentDeleteFilesAction(payload);
          toast.success("Seçilen dosyalar kalıcı olarak silindi!");
        }
        setSelectedKeys([]);
      } else if (modalState.targetFile) {
        if (modalState.type === "restore") {
          await restoreFileAction(modalState.targetFile.projectId, modalState.targetFile.url);
          toast.success("Dosya geri yüklendi!");
        } else {
          await permanentDeleteFileAction(modalState.targetFile.projectId, modalState.targetFile.url);
          toast.success("Dosya kalıcı olarak silindi!");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };


  if (files.length === 0) {
    return (
      <EmptyState
        icon={Trash2}
        title="Çöp kutusu boş"
        description="Silinmiş dosyanız bulunmuyor."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toplu İşlem Barı */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:text-slate-100 transition-colors">
          {selectedKeys.length === files.length && files.length > 0 ? (
            <CheckSquare className="w-5 h-5 text-violet-600" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
          Tümünü Seç ({selectedKeys.length}/{files.length})
        </button>
        <div className="flex items-center gap-3">
          <button
            disabled={selectedKeys.length === 0}
            onClick={() => setModalState({ isOpen: true, type: "restore", isBulk: true })}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Seçilenleri Geri Yükle
          </button>
          <button
            disabled={selectedKeys.length === 0}
            onClick={() => setModalState({ isOpen: true, type: "delete", isBulk: true })}
            className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Trash className="w-4 h-4" />
            Seçilenleri Kalıcı Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, i) => {
          const key = `${file.projectId}::${file.url}`;
          const isSelected = selectedKeys.includes(key);
          return (
            <div key={i} className={`bg-white dark:bg-slate-900 border-2 rounded-xl p-4 flex items-center justify-between shadow-sm transition-colors ${isSelected ? 'border-violet-500' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <button onClick={() => toggleSelect(file)} className="shrink-0 text-slate-400 hover:text-violet-600 transition-colors">
                  {isSelected ? <CheckSquare className="w-5 h-5 text-violet-600" /> : <Square className="w-5 h-5" />}
                </button>
                <div className="w-10 h-10 bg-slate-100 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center shrink-0">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-100 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{file.projectName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setModalState({ isOpen: true, type: "restore", isBulk: false, targetFile: file })}
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-200 dark:text-slate-100 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Geri Yükle
                </button>
                <button
                  onClick={() => setModalState({ isOpen: true, type: "delete", isBulk: false, targetFile: file })}
                  className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Kalıcı Sil
                </button>
              </div>
            </div>
          );
        })}
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
                ? `Seçilen ${selectedKeys.length} dosyayı ${modalState.type === "restore" ? "geri yüklemek" : "kalıcı olarak silmek"} istediğinize emin misiniz?`
                : `Bu dosyayı ${modalState.type === "restore" ? "geri yüklemek" : "kalıcı olarak silmek"} istediğinize emin misiniz?`}
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
