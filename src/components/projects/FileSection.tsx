"use client";

import React, { useState, useRef } from 'react';
import { Upload, File, X, Loader2, Download, Trash2, HardDrive } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { uploadFileAction, deleteFileAction, ProjectFile } from '@/lib/actions';
import { toast } from 'react-hot-toast';

interface FileSectionProps {
  projectId: string;
  initialFiles: ProjectFile[];
  isOwner: boolean;
}

export default function FileSection({ projectId, initialFiles, isOwner }: FileSectionProps) {
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limitler
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${projectId}/${fileName}`;

      // Storage'a yükle
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setUploadProgress(70);

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // Server Action ile veritabanını güncelle
      await uploadFileAction(
        projectId,
        file.name,
        publicUrl,
        file.size,
        file.type
      );

      const newFile: ProjectFile = {
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString()
      };

      setFiles(prev => [...prev, newFile]);
      toast.success("Dosya başarıyla yüklendi.");
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error("Yükleme hatası:", error);
      toast.error("Dosya yüklenemedi: " + (error.message || "Bilinmeyen hata"));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileUrl: string) => {
    if (!confirm("Bu dosyayı silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteFileAction(projectId, fileUrl);
      setFiles(prev => prev.filter(f => f.url !== fileUrl));
      toast.success("Dosya silindi.");
    } catch (error: any) {
      toast.error("Dosya silinemedi: " + error.message);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-400" /> Proje Dosyaları
        </h3>
        {isOwner && (
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden" 
              disabled={isUploading}
            />
            <button 
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
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {files.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-xl">
            <File className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Henüz dosya yüklenmemiş.</p>
          </div>
        ) : (
          files.map((file, idx) => (
            <div key={idx} className="group flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-indigo-400 shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  download 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  title="İndir"
                >
                  <Download className="w-4 h-4" />
                </a>
                {isOwner && (
                  <button 
                    onClick={() => handleDelete(file.url)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
