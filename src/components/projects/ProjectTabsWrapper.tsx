'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, CheckSquare, FileText, MessageSquare, LineChart } from 'lucide-react';
import ProjectAnalytics from '@/components/projects/ProjectAnalytics';

type TabType = 'overview' | 'team' | 'milestones' | 'files' | 'notes' | 'analytics';

interface ProjectTabsWrapperProps {
  overviewContent: ReactNode;
  teamContent?: ReactNode;
  milestonesContent?: ReactNode;
  filesContent?: ReactNode;
  notesContent?: ReactNode;
  showNotesTab: boolean;
  hasNotes?: boolean;
  projectId?: string;
  currentUserId?: string;
  projectNotes?: any[];
  reviews?: any[];
}

export default function ProjectTabsWrapper({
  overviewContent,
  teamContent,
  milestonesContent,
  filesContent,
  notesContent,
  showNotesTab,
  hasNotes,
  projectId,
  currentUserId,
  projectNotes = [],
  reviews = [],
}: ProjectTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [hasViewedNotes, setHasViewedNotes] = useState(false);
  const [hasUnreadNotes, setHasUnreadNotes] = useState(false);

  useEffect(() => {
    if (!projectId || typeof window === 'undefined') return;

    // Check if there are notes/reviews from OTHERS
    const othersNotes = projectNotes.filter((n: any) => n.user_id !== currentUserId);
    const othersReviews = reviews.filter((r: any) => r.reviewer_id !== currentUserId);
    
    if (othersNotes.length === 0 && othersReviews.length === 0) {
      setHasUnreadNotes(false);
      return;
    }

    const latestNoteTime = Math.max(
      ...othersNotes.map((n: any) => new Date(n.created_at).getTime()),
      ...othersReviews.map((r: any) => new Date(r.created_at).getTime()),
      0
    );

    const lastReadStr = localStorage.getItem(`project_read_${projectId}`);
    const lastReadTime = lastReadStr ? new Date(lastReadStr).getTime() : 0;

    if (latestNoteTime > lastReadTime) {
      setHasUnreadNotes(true);
    }
  }, [projectId, currentUserId, projectNotes, reviews]);

  const handleTabClick = (id: TabType) => {
    setActiveTab(id);
    if (id === 'notes') {
      setHasViewedNotes(true);
      setHasUnreadNotes(false);
      if (projectId && typeof window !== 'undefined') {
        localStorage.setItem(`project_read_${projectId}`, new Date().toISOString());
      }
    }
  };

    const tabs = [
    { id: 'overview', label: 'Genel Bakış & Takım', icon: Layers },
  ];
  if (milestonesContent) {
    tabs.push({ id: 'milestones', label: 'Görevler', icon: CheckSquare });
  }
  tabs.push({ id: 'files', label: 'Dosyalar', icon: FileText });

  if (showNotesTab) {
      tabs.push({ id: 'notes', label: 'Notlar & Değerlendirme', icon: MessageSquare });
    }
    tabs.push({ id: 'analytics', label: 'Analizler', icon: LineChart });

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full">
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as TabType)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-semibold text-sm relative ${isActive ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-700 border border-slate-100 hover:border-violet-200'} dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              
            </button>
          );
        })}
      </div>

      <div className="flex-1 w-full bg-white/40 border border-white/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm min-h-[400px] relative">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {overviewContent}
            </motion.div>
          )}
          {activeTab === 'milestones' && (
            <motion.div key="milestones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {milestonesContent}
            </motion.div>
          )}
          {activeTab === 'files' && (
            <motion.div key="files" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {filesContent}
            </motion.div>
          )}
          {activeTab === 'notes' && showNotesTab && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {notesContent}
            </motion.div>
          )}
          
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {projectId ? <ProjectAnalytics projectId={projectId} /> : <div className="text-slate-500">Proje bilgisi bulunamadı.</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}