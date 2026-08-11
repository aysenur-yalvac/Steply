'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save } from 'lucide-react';
import ImageViewer from './viewer/ImageViewer';
import PdfViewer from './viewer/PdfViewer';
import CodeViewer from './viewer/CodeViewer';
import FallbackViewer from './viewer/FallbackViewer';
import { getFileAnnotationsAction, saveFileAnnotationAction, saveFileDrawingsAction } from '@/lib/actions';
import toast from 'react-hot-toast';

import { ProjectFile } from '@/lib/actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: ProjectFile | null;
  projectId: string;
  canManageFiles: boolean; // teacher or project owner
}

export default function SmartFileViewerModal({ isOpen, onClose, file, projectId, canManageFiles }: Props) {
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // New annotation data staged by the viewer (from konva or notes)
  const [stagedAnnotation, setStagedAnnotation] = useState<any>(null);

  useEffect(() => {
    if (isOpen && file) {
      loadAnnotations();
    } else {
      setAnnotations([]);
      setStagedAnnotation(null);
    }
  }, [isOpen, file]);

  const loadAnnotations = async () => {
    if (!file) return;
    setIsLoading(true);
    const res = await getFileAnnotationsAction(file.url);
    if (res.data) {
      setAnnotations(res.data);
    } else {
      console.error(res.error);
    }
    setIsLoading(false);
  };

  
  const handleImmediateSave = async (data: any) => {
    if (!file) return;
    const res = await saveFileAnnotationAction(projectId, file.url, data);
    if (res.error) {
      toast.error('Not kaydedilemedi: ' + res.error);
    } else if (res.data) {
      toast.success('Not eklendi!');
      setAnnotations((prev) => [...prev, res.data]);
    }
  };

  const handleSaveAnnotation = () => {
    if (!file || !stagedAnnotation) return;
    setIsSaving(true);
    
    const savePromise = async () => {
      let res;
      if (stagedAnnotation.type === 'drawing') {
        res = await saveFileDrawingsAction(projectId, file.url, JSON.stringify(stagedAnnotation.lines));
      } else {
        res = await saveFileAnnotationAction(projectId, file.url, stagedAnnotation);
      }
      if (res.error) throw new Error(res.error.message || res.error);
      return res.data;
    };

    toast.promise(savePromise(), {
      loading: 'Kaydediliyor...',
      success: (data) => {
        setAnnotations((prev) => [...prev, data]);
        setStagedAnnotation(null);
        setIsSaving(false);
        return 'Çizimler başarıyla kaydedildi!';
      },
      error: (err) => {
        setIsSaving(false);
        console.error("🔥 SUPABASE GERÇEK HATA:", err);
        return 'Hata: ' + err.message;
      }
    });
  };

  if (!mounted || !isOpen || !file) return null;

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isCode = file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/javascript';

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black/80 flex flex-col p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-transparent"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full h-full bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{file.name}</h2>
              <p className="text-xs text-slate-500">Smart Preview & Annotation</p>
            </div>
            <div className="flex items-center gap-3">
              {stagedAnnotation && (
                <button
                  onClick={handleSaveAnnotation}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-auto relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : (
              <>
                {isImage && (
                  <ImageViewer 
                    file={file} 
                    annotations={annotations} 
                    onStageAnnotation={setStagedAnnotation} 
                    onImmediateSave={handleImmediateSave}
                    canAnnotate={canManageFiles} 
                  />
                )}
                {isPdf && (
                  <PdfViewer 
                    file={file} 
                    annotations={annotations} 
                    onStageAnnotation={setStagedAnnotation} 
                    onImmediateSave={handleImmediateSave}
                    canAnnotate={canManageFiles} 
                  />
                )}
                {isCode && (
                  <CodeViewer 
                    file={file} 
                    annotations={annotations} 
                    onStageAnnotation={setStagedAnnotation} 
                    onImmediateSave={handleImmediateSave}
                    canAnnotate={canManageFiles} 
                  />
                )}
                {!isImage && !isPdf && !isCode && (
                  <FallbackViewer 
                    file={file} 
                    annotations={annotations} 
                    onStageAnnotation={setStagedAnnotation} 
                    onImmediateSave={handleImmediateSave}
                    canAnnotate={canManageFiles} 
                  />
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}