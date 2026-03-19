"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut,
  Bookmark
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthProvider';
import WatchlistDrawer from '@/components/dashboard/WatchlistDrawer';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { user, signOut, loading } = useAuth();

  // useEffect for hydration mismatch prevention
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const closeMenus = () => {
    setIsMenuOpen(false);
  };


  return (
    <nav className="w-full py-4 px-6 md:px-12 flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-slate-950/40 backdrop-blur-2xl sticky top-0 z-50 transition-colors duration-300 shadow-sm">
      <div className="flex justify-between items-center w-full md:w-auto">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity" onClick={closeMenus}>
            <div className="w-7 h-7 relative overflow-hidden flex items-center justify-center rounded-sm">
              <img src="/image_5.png" alt="Steply Logo" className="w-8 h-8 max-w-none object-cover scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] dark:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
            </div>
            <span className="font-bold text-2xl tracking-tight">Steply</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4 md:hidden">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-slate-200/20 dark:bg-white/10 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-amber-500/80 dark:text-amber-200/40 hover:text-amber-400 dark:hover:text-amber-200 transition-colors drop-shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Navigation Links & Actions */}
      <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0`}>
        
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg bg-slate-200/20 dark:bg-white/10 backdrop-blur-md border border-slate-200/50 dark:border-white/10 text-amber-500/80 dark:text-amber-200/40 hover:text-amber-400 dark:hover:text-amber-200 transition-colors drop-shadow-sm hidden md:block"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {!loading && (
          <>
            {user ? (
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <Link 
                  href="/dashboard" 
                  className="w-full md:w-auto text-sm font-medium text-center text-slate-700 dark:text-slate-200 hover:text-indigo-500 transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" /> Projects
                </Link>
                <Link 
                  href="/dashboard/profile" 
                  className="w-full md:w-auto text-sm font-medium text-center text-slate-700 dark:text-slate-200 hover:text-indigo-500 transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                  onClick={closeMenus}
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button 
                  onClick={() => { setIsWatchlistOpen(true); closeMenus(); }}
                  className="w-full md:w-auto text-sm font-medium text-center text-slate-700 dark:text-slate-200 hover:text-dusty-rose transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-4 h-4" /> Watchlist
                </button>
                <button 
                  onClick={() => signOut()}
                  className="w-full md:w-auto text-sm font-extrabold text-center tracking-wide text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-500" strokeWidth={2.5} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <Link 
                  href="/auth/login" 
                  onClick={closeMenus}
                  className="w-full md:w-auto text-sm font-medium text-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 md:px-4"
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/register" 
                  onClick={closeMenus}
                  className="w-full md:w-auto text-sm font-medium text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-6 transition-all shadow-[0_4px_20px_-5px_rgba(79,70,229,0.5)] active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <WatchlistDrawer isOpen={isWatchlistOpen} onClose={() => setIsWatchlistOpen(false)} />
    </nav>
  );
}
