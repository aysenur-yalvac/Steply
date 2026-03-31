"use client";

import React, { useState, useRef } from 'react';
import { Upload, File, Loader2, Download, Trash2, HardDrive, Lock } from 'lucide-react';
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
  const [makePrivate, setMakePrivate] = useState(false);
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
      const result = await uploadFileAction(formData);

      if ('error' in result) {
        console.error("[FileSection] Upload error:", result.error);
        toast.error("Upload failed: " + result.error);
      } else {
        setUploadProgress(100);
        setFiles(prev => [...prev, result.file]);
        toast.success("File uploaded successfully.");
      }
    } catch (err: unknown) {
      // Network-level failure — server action itself crashed
      console.error("[FileSection] Unexpected upload error:", err);
      toast.error("Upload failed. Please try again.");
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

  // Absolute privacy: private files visible ONLY to the project owner
  const visibleFiles = files.filter(file => !file.isPrivate || isOwner);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-500" /> Project Files
        </h3>
        {isOwner && (
          <form action={handleUploadAction} className="flex items-center gap-3">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="isPrivate" value={makePrivate ? "true" : "false"} />

            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={makePrivate}
                onChange={(e) => setMakePrivate(e.target.checked)}
                className="rounded border-slate-300 accent-[#7C3AFF] cursor-pointer"
              />
              <Lock className="w-3 h-3 text-slate-400" />
              Private
            </label>

            <input
              type="file"
              name="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) e.target.form?.requestSubmit();
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
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-center">Uploading via secure server...</p>
        </div>
      )}

      <div className="space-y-3">
        {visibleFiles.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50">
            <File className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No files uploaded yet.</p>
          </div>
        ) : (
          visibleFiles.map((file, idx) => (
            <div
              key={file.id ?? idx}
              className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors"
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
                    {formatSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(file.url)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
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

      {!isOwner && files.some(f => f.isPrivate) && (
        <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" />
          {files.filter(f => f.isPrivate).length} private file(s) are hidden.
        </p>
      )}
    </div>
  );
}
