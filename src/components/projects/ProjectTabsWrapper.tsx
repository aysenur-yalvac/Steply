'use client';

import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, CheckSquare, FileText, MessageSquare } from 'lucide-react';

type TabType = 'overview' | 'team' | 'milestones' | 'files' | 'notes';

interface ProjectTabsWrapperProps {
  overviewContent: ReactNode;
  teamContent?: ReactNode;
  milestonesContent?: ReactNode;
  filesContent?: ReactNode;
  notesContent?: ReactNode;
  showNotesTab: boolean;
}

export default function ProjectTabsWrapper({
  overviewContent,
  teamContent,
  milestonesContent,
  filesContent,
  notesContent,
  showNotesTab,
}: ProjectTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Genel Bakış & Takım', icon: Layers },
    { id: 'milestones', label: 'Görevler', icon: CheckSquare },
    { id: 'files', label: 'Dosyalar', icon: FileText },
  ];

  if (showNotesTab) {
    tabs.push({ id: 'notes', label: 'Notlar & Değerlendirme', icon: MessageSquare });
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start w-full">
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-semibold text-sm ${isActive ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-violet-50 hover:text-violet-700 border border-slate-100 hover:border-violet-200'}`}
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
            <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {notesContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}