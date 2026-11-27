'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, CheckSquare, FileText, MessageSquare, LineChart } from 'lucide-react';
import ProjectAnalyticsView, { TeamMember } from './ProjectAnalyticsView';
import { getProjectTasksAction, ProjectTask } from '@/lib/actions';

type TabType = 'overview' | 'team' | 'milestones' | 'files' | 'notes' | 'analytics';

interface ProjectTabsWrapperProps {
  overviewContent: ReactNode;
  teamContent?: ReactNode;
  milestonesContent?: ReactNode;
  filesContent?: ReactNode;
  notesContent?: ReactNode;
  analyticsContent?: ReactNode;
  rightSidebarContent?: ReactNode;
  showNotesTab: boolean;
  showAnalyticsTab?: boolean;
  hasNotes?: boolean;
  projectId?: string;
  currentUserId?: string;
  projectNotes?: any[];
  reviews?: any[];
  initialTasks?: ProjectTask[];
  teamMembers?: TeamMember[];
}

export default function ProjectTabsWrapper({
  overviewContent,
  teamContent,
  milestonesContent,
  filesContent,
  notesContent,
  analyticsContent,
  rightSidebarContent,
  showNotesTab,
  showAnalyticsTab = true,
  hasNotes,
  projectId,
  currentUserId,
  projectNotes = [],
  reviews = [],
  initialTasks = [],
  teamMembers = [],
}: ProjectTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [hasViewedNotes, setHasViewedNotes] = useState(false);
  const [hasUnreadNotes, setHasUnreadNotes] = useState(false);

  // Keep tasks synced if server-rendered initialTasks changes (preserving in-flight temp-* optimistic tasks)
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).__isLeavingProject) return;
    setTasks((prev) => {
      const temps = prev.filter((t) => String(t.id).startsWith('temp-'));
      return [...initialTasks, ...temps];
    });
  }, [initialTasks]);

  // Instant update when project_tasks table changes in Realtime for this project
  useEffect(() => {
    if (!projectId) return;
    function handleRealtimeTasks(e: Event) {
      if (typeof window !== "undefined" && (window as any).__isLeavingProject) return;
      const custom = e as CustomEvent<any>;
      const payload = custom.detail;
      if (!payload) return;
      const newRow = payload.new as any;
      const oldRow = payload.old as any;

      if (payload.eventType === 'INSERT' && newRow && newRow.project_id === projectId) {
        setTasks((prev) => {
          if (prev.some((t) => t.id === newRow.id)) return prev;
          const tempIdx = prev.findIndex(
            (t) => String(t.id).startsWith('temp-') && t.title === newRow.title
          );
          if (tempIdx !== -1) {
            const copy = [...prev];
            copy[tempIdx] = newRow as ProjectTask;
            return copy;
          }
          return [...prev, newRow as ProjectTask];
        });
      } else if (payload.eventType === 'UPDATE' && newRow && newRow.project_id === projectId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === newRow.id ? { ...t, ...(newRow as ProjectTask) } : t))
        );
      } else if (payload.eventType === 'DELETE' && oldRow?.id) {
        setTasks((prev) => prev.filter((t) => t.id !== oldRow.id));
      }
    }

    window.addEventListener('project_tasks_updated', handleRealtimeTasks);
    return () => window.removeEventListener('project_tasks_updated', handleRealtimeTasks);
  }, [projectId]);

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
    // Background refresh tasks when switching to milestones or analytics
    if ((id === 'milestones' || id === 'analytics') && projectId) {
      getProjectTasksAction(projectId)
        .then((res) => {
          if (res.success && res.tasks) {
            setTasks(res.tasks);
          }
        })
        .catch((err) => console.error('[ProjectTabsWrapper] Failed to refresh tasks:', err));
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
  if (showAnalyticsTab) {
    tabs.push({ id: 'analytics', label: 'Analizler', icon: LineChart });
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 md:gap-8 items-start w-full">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start flex-1 w-full min-w-0">
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-1.5 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id as TabType)}
                className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 min-h-[44px] py-2.5 sm:py-3 rounded-xl transition-all text-left font-semibold text-xs sm:text-sm relative border whitespace-nowrap shrink-0 md:whitespace-normal cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 border-violet-600 dark:bg-violet-600 dark:text-white dark:border-violet-600'
                    : 'bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-700 border-slate-100 hover:border-violet-200 dark:bg-[#1a2234] dark:text-slate-300 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 pointer-events-none" />
                <span className="pointer-events-none">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 w-full min-w-0 bg-white dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm min-h-[400px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.1 }}>
                {overviewContent}
              </motion.div>
            )}
            {activeTab === 'milestones' && (
              <motion.div key="milestones" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.1 }}>
                {React.isValidElement(milestonesContent)
                  ? React.cloneElement(milestonesContent as any, {
                      tasks,
                      onTasksChange: setTasks,
                      initialTasks: tasks,
                    })
                  : milestonesContent}
              </motion.div>
            )}
            {activeTab === 'files' && (
              <motion.div key="files" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.1 }}>
                {filesContent}
              </motion.div>
            )}
            {activeTab === 'notes' && showNotesTab && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.1 }}
                className="w-full"
              >
                {notesContent}
              </motion.div>
            )}
            
            {activeTab === 'analytics' && showAnalyticsTab && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.1 }}
              >
                <ProjectAnalyticsView tasks={tasks} members={teamMembers} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {rightSidebarContent && activeTab !== 'notes' && (
        <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
          {rightSidebarContent}
        </div>
      )}
    </div>
  );
}
