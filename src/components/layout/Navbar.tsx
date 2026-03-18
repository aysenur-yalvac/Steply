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
  LogOut
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthProvider';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <nav className="w-full py-4 px-6 md:px-12 flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="flex justify-between items-center w-full md:w-auto">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity" onClick={closeMenus}>
            <BookOpen className="w-7 h-7 text-indigo-500" />
            <span className="font-bold text-2xl tracking-tight">Steply</span>
          </Link>
          
          {/* USER REQUESTED: ZORLA EKLENEN PROJECTS BUTONU */}
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg border border-indigo-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors shadow-sm" onClick={closeMenus}>
            <BookOpen className="w-4 h-4" /> Projects
          </Link>
        </div>
        
        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors"
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
        
        {/* Theme Toggle (Desktop) */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors hidden md:block"
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
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full md:w-auto text-sm font-medium text-center text-red-600 dark:text-red-400 hover:text-red-700 transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
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

    </nav>
  );
}
