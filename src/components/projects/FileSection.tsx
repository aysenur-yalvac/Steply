"use client";

import React, { useState, useRef } from 'react';
import { Upload, File, Loader2, Download, Trash2, HardDrive } from 'lucide-react';
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

  const handleUploadAction = async (formData: FormData) => {
    const file = formData.get("file") as File;
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      setUploadProgress(50);

      // Call Server Action — handles Storage upload + DB update server-side
      const result = await uploadFileAction(formData);

      setUploadProgress(100);

      if (result?.file) {
        setFiles(prev => [...prev, result.file]);
      }

      toast.success("File uploaded successfully.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[FileSection] Upload error:", error);
      toast.error("Upload failed: " + errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await deleteFileAction(projectId, fileUrl);
      setFiles(prev => prev.filter(f => f.url !== fileUrl));
      toast.success("File deleted.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[FileSection] Delete error:", error);
      toast.error("Could not delete file: " + errorMessage);
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
          <HardDrive className="w-5 h-5 text-indigo-400" /> Project Files
        </h3>
        {isOwner && (
          <form action={handleUploadAction} className="relative">
            <input type="hidden" name="projectId" value={projectId} />
            <input 
              type="file" 
              name="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  e.target.form?.requestSubmit();
                }
              }}
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
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
        )}
      </div>

      {isUploading && (
        <div className="mb-6">
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-center">Uploading via secure server...</p>
        </div>
      )}

      <div className="space-y-3">
        {files.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-xl">
            <File className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No files uploaded yet.</p>
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
                  <p className="text-xs text-slate-500">{formatSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString('en-US')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  download 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                {isOwner && (
                  <button 
                    onClick={() => handleDelete(file.url)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Delete"
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
