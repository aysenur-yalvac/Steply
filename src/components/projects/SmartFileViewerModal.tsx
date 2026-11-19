'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Save, Download } from 'lucide-react';
import ImageViewer from './viewer/ImageViewer';
import PdfViewer from './viewer/PdfViewer';
import CodeViewer from './viewer/CodeViewer';
import FallbackViewer from './viewer/FallbackViewer';
import { getFileAnnotationsAction, saveFileAnnotationAction, saveFileDrawingsAction, getFileViewUrlAction } from '@/lib/actions';
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
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // New annotation data staged by the viewer (from konva or notes)
  const [stagedAnnotation, setStagedAnnotation] = useState<any>(null);

  useEffect(() => {
    let isCurrent = true;
    if (isOpen && file) {
      loadAnnotations();
      setIsResolvingUrl(true);
      getFileViewUrlAction(projectId, file.url)
        .then((res) => {
          if (isCurrent && res.success && res.viewUrl) {
            setResolvedUrl(res.viewUrl);
          }
        })
        .catch((err) => {
          console.error('[SmartFileViewerModal] Signed URL error:', err);
        })
        .finally(() => {
          if (isCurrent) setIsResolvingUrl(false);
        });
    } else {
      setAnnotations([]);
      setStagedAnnotation(null);
      setResolvedUrl('');
    }
    return () => { isCurrent = false; };
  }, [isOpen, file, projectId]);

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

  const handleSaveAnnotation = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!file || !stagedAnnotation) return;

    try {
      setIsSaving(true);

      let res;
      if (stagedAnnotation.type === 'drawing') {
        const payloadToSave = stagedAnnotation.pages || stagedAnnotation.lines;
        res = await saveFileDrawingsAction(projectId, file.url, JSON.stringify(payloadToSave));
      } else {
        res = await saveFileAnnotationAction(projectId, file.url, stagedAnnotation);
      }

      if (res?.error) {
        toast.error("Kaydedilemedi", { position: "bottom-right" });
        return;
      }

      toast.success("Kaydedildi", { position: "bottom-right" });
      setAnnotations((prev) => [...prev, res.data]);
      setStagedAnnotation(null);
      
      // ANCAK KAYIT BAÅARILIYSA MODALI KAPAT:
      onClose();
    } catch (err: any) {
      toast.error("Kaydedilemedi", { position: "bottom-right" });
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !isOpen || !file) return null;
  const activeFile = { ...file, url: resolvedUrl || file.url };

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
          className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative z-10" onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{file.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smart Preview & Annotation</p>
            </div>
            <div className="flex items-center gap-2.5">
              <a
                href={activeFile.url}
                target="_blank"
                rel="noreferrer"
                download={file.name}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"
                title="İndir"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">İndir</span>
              </a>
              <button
                type="button"
                onClick={handleSaveAnnotation}
                  disabled={isSaving || !stagedAnnotation}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 relative z-50 pointer-events-auto"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-auto relative bg-slate-100 dark:bg-slate-950">
            {(isLoading || isResolvingUrl) ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : (
              <>
                {isImage && (
                  <ImageViewer 
                    file={activeFile} 
                    annotations={annotations} 
                    onStageAnnotation={setStagedAnnotation} 
                    onImmediateSave={handleImmediateSave}
                    canAnnotate={canManageFiles} 
                  />
                )}
                {isPdf && (
                  <PdfViewer 
                    file={activeFile} 
                    annotations={annotations} 
                    onStageAnnotation={setStagedAnnotation} 
                    onImmediateSave={handleImmediateSave}
                    canAnnotate={canManageFiles} 
                  />
                )}
                {isCode && (
                  <CodeViewer 
                    file={activeFile} 
                    annotations={annotations} 
                    onStageAnnotation={setStagedAnnotation} 
                    onImmediateSave={handleImmediateSave}
                    canAnnotate={canManageFiles} 
                  />
                )}
                {!isImage && !isPdf && !isCode && (
                  <FallbackViewer 
                    file={activeFile} 
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
