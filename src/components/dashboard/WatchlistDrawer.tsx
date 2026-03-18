"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import { getWatchlistAction } from '@/lib/actions';
import Link from 'next/link';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WatchlistDrawer({ isOpen, onClose }: WatchlistDrawerProps) {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getWatchlistAction().then(res => {
        if (res.success) setWatchlist(res.data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  // Prevent scrolling on body when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Bookmark className="w-5 h-5 text-dusty-rose" fill="currentColor" /> Watchlist
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {loading ? (
                <div className="flex items-center justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-dusty-rose" /></div>
              ) : watchlist.length === 0 ? (
                <p className="text-slate-500 text-center mt-10">You have no watched projects yet.</p>
              ) : (
                watchlist.map(project => (
                  <Link href={`/dashboard/projects/${project.id}`} onClick={onClose} key={project.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-dusty-rose/50 hover:bg-rose-50/10 dark:hover:bg-rose-900/10 hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-dusty-rose transition-colors pr-6">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">Student: {project.studentName}</p>
                    <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-slate-300 group-hover:text-dusty-rose transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
