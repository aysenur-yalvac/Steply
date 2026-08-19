"use client";

import React, { useState, useRef, useOptimistic, startTransition } from 'react';
import { Upload, File, Loader2, Download, Trash2, HardDrive, Lock } from 'lucide-react';
import { saveFileRecordAction, softDeleteFileAction, ProjectFile, FileVisibility } from '@/lib/actions';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import SmartFileViewerModal from './SmartFileViewerModal';
import { Eye } from 'lucide-react';

const BUCKET_ID = "project-files";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

interface FileSectionProps {
  projectId: string;
  initialFiles: ProjectFile[];
  isOwner: boolean;
  isCollaborator?: boolean;
}

type PendingFile = ProjectFile & { pending?: boolean };

function sanitizeName(name: string): string {
  return name
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/[^a-zA-Z0-9.-]/g, '_');
}

export default function FileSection({ projectId, initialFiles, isOwner, isCollaborator = false, currentUserId }: FileSectionProps & { currentUserId?: string }) {
  // Collaborators have the same file management rights as the owner
  const canManageFiles = isOwner || isCollaborator;
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [viewerFile, setViewerFile] = useState<ProjectFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileVisibility, setFileVisibility] = useState<FileVisibility>('MEMBERS_ONLY');
  const [deleteModalTarget, setDeleteModalTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFiles = files.filter(f => !(f as any).deleted_at);
  const [optimisticFiles, addOptimisticFile] = useOptimistic<PendingFile[], PendingFile>(
    activeFiles as PendingFile[],
    (state, pending) => [...state, pending],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Dosya boyutu 100MB'ı geçemez. (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Optimistic: add pending card immediately
    startTransition(() => {
      addOptimisticFile({
        id: `pending-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        uploaded_at: new Date().toISOString(),
        visibility: fileVisibility,
      uploaderId: currentUserId,
      isPrivate: fileVisibility !== 'PUBLIC',
        pending: true,
      });
    });

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // ── Step 1: Upload directly browser → Supabase Storage ──────────────
      const safeName = sanitizeName(file.name);
      const filePath = `${projectId}/${Date.now()}-${safeName}`;

      const supabase = createClient();
      setUploadProgress(30);

      const { error: storageError } = await supabase.storage
        .from(BUCKET_ID)
        .upload(filePath, file, {
          contentType: file.type || 'application/octet-stream',
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) {
        toast.error(`Storage Upload Hatası: ${storageError.message}`);
        return;
      }

      setUploadProgress(75);

      // ── Step 2: Persist record to DB via server action ────────────────────
      const result = await saveFileRecordAction(
        projectId,
        file.name,
        filePath,
        file.size,
        file.type,
        fileVisibility,
      );

      setUploadProgress(100);

      if ('error' in result) {
        toast.error('Kayıt hatası: ' + result.error);
      } else {
        setFiles(prev => [...prev, result.file]);
        toast.success('Dosya başarıyla yüklendi.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      console.error('[FileSection] upload error:', err);
      toast.error('Yükleme başarısız: ' + msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  
  const handleDeleteClick = (fileUrl: string) => {
    setDeleteModalTarget(fileUrl);
  };

  const confirmDelete = async () => {
    if (!deleteModalTarget) return;
    setIsDeleting(true);
    const fileUrl = deleteModalTarget;
    // Optimistic UI: anında kaldır
    setFiles(prev => prev.filter(f => f.url !== fileUrl));
    
    try {
      await softDeleteFileAction(projectId, fileUrl);
      toast.success('Dosya çöp kutusuna taşındı.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error('Dosya silinemedi: ' + errorMessage);
      // Geri al (isteğe bağlı) - şu anlık basit optimistic kalsın
    } finally {
      setIsDeleting(false);
      setDeleteModalTarget(null);
    }
  };


  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const visibleFiles = optimisticFiles.filter(file => {
    const isUploader = file.uploaderId === currentUserId;
    const isMember = canManageFiles;

    if (isUploader) return true;
    if (file.visibility === 'ONLY_ME') return false;
    if (isMember) return true;
    return file.visibility === 'PUBLIC' || file.isPrivate === false;
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-500" /> Project Files
        </h3>
        {canManageFiles && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <select
                value={fileVisibility}
                onChange={(e) => setFileVisibility(e.target.value as FileVisibility)}
                className="bg-white border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 dark:text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer w-full sm:w-[220px]"
              >
                <option value="PUBLIC">🌐 Herkese Açık</option>
                <option value="MEMBERS_ONLY">👥 Sadece Ekip Üyeleri</option>
                <option value="ONLY_ME">🔒 Sadece Bana Özel</option>
              </select>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-xl text-sm font-medium transition-all"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Yükleniyor...' : 'Dosya Yükle'}
            </button>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="mb-6">
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-center">Doğrudan Supabase'e yükleniyor...</p>
        </div>
      )}

      <div className="space-y-3">
        {visibleFiles.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50">
            <File className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Henüz dosya yüklenmedi.</p>
          </div>
        ) : (
          visibleFiles.map((file, idx) => (
            <div
              key={file.id ?? idx}
              onClick={() => { if (!(file as PendingFile).pending) setViewerFile(file as ProjectFile); }}
              className={`group flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-slate-100 cursor-pointer transition-colors ${(file as PendingFile).pending ? 'opacity-60 animate-pulse pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 relative">
                  <File className="w-5 h-5" />
                  {file.isPrivate && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7C3AFF] flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                    {file.isPrivate && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7C3AFF]/10 text-[#7C3AFF] border border-[#7C3AFF]/20 uppercase tracking-wide">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {formatSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {(file as PendingFile).pending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewerFile(file as ProjectFile);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Görüntüle & Not Ekle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="İndir"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {canManageFiles && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(file.url);
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      
      
      <SmartFileViewerModal
        isOpen={!!viewerFile}
        onClose={() => setViewerFile(null)}
        file={viewerFile}
        projectId={projectId}
        canManageFiles={canManageFiles}
      />
    
      {/* Silme Onay Modalı */}
      {deleteModalTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Dosya Çöp Kutusuna Taşınsın mı?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Bu dosya çöp kutusuna gönderilecek. Dilediğiniz zaman geri yükleyebilirsiniz.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2 bg-[#7C3AFF] hover:bg-[#682ad4]"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Taşınıyor..." : "Çöp Kutusuna Taşı"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
