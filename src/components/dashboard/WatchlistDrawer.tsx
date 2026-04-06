"use client";

import React, { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, ExternalLink } from 'lucide-react';
import { getWatchlistAction } from '@/lib/actions';
import Link from 'next/link';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Memoized individual item to prevent re-renders
const WatchlistItem = memo(function WatchlistItem({
  project,
  onClose,
}: {
  project: any;
  onClose: () => void;
}) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      onClick={onClose}
      className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 hover:border-amber-400/50 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden"
    >
      <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-dusty-rose transition-colors pr-6">
        {project.title}
      </h3>
      <p className="text-sm text-slate-500 font-medium">Student: {project.studentName}</p>
      <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
    </Link>
  );
});

export default function WatchlistDrawer({ isOpen, onClose }: WatchlistDrawerProps) {
  const [watchlist, setWatchlist] = useState<any[]>([]);

  // Fetch immediately on mount — data is ready before drawer opens
  const fetchWatchlist = useCallback(() => {
    getWatchlistAction().then(res => {
      if (res.success) setWatchlist(res.data);
    });
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Refresh when re-opened in case of changes (no spinner — stale data shown instantly)
  useEffect(() => {
    if (isOpen) fetchWatchlist();
  }, [isOpen, fetchWatchlist]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-2xl z-50 flex flex-col border-l border-slate-200/50 dark:border-slate-800/50"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Bookmark className="w-5 h-5 text-dusty-rose" fill="currentColor" /> Watchlist
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {watchlist.length === 0 ? (
                <p className="text-slate-500 text-center mt-10">You have no watched projects yet.</p>
              ) : (
                watchlist.map(project => (
                  <WatchlistItem key={project.id} project={project} onClose={onClose} />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
