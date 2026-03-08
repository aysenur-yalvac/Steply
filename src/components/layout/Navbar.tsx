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
  Monitor, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthProvider';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();

  // useEffect for hydration mismatch prevention
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsThemeMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const themeIcons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />,
  };

  return (
    <nav className="w-full py-4 px-6 md:px-12 flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="flex justify-between items-center w-full md:w-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity" onClick={closeMenus}>
          <BookOpen className="w-7 h-7 text-indigo-500" />
          <span className="font-bold text-2xl tracking-tight">Steply</span>
        </Link>
        
        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile Theme Toggle */}
          <button 
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors"
          >
            {theme === 'system' ? <Monitor className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
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
        
        {/* Theme Switcher Dropdown (Desktop) */}
        <div className="relative hidden md:block">
          <button 
            onClick={() => {
              setIsThemeMenuOpen(!isThemeMenuOpen);
              setIsUserMenuOpen(false);
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
             {theme === 'system' ? <Monitor className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          
          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Sun className="w-4 h-4 text-orange-500" /> Açık
              </button>
              <button onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Moon className="w-4 h-4 text-indigo-400" /> Karanlık
              </button>
              <button onClick={() => { setTheme('system'); setIsThemeMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Monitor className="w-4 h-4 text-slate-400" /> Sistem
              </button>
            </div>
          )}
        </div>

        {!loading && (
          <>
            {user ? (
              <div className="relative w-full md:w-auto">
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsThemeMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between md:justify-start gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                    {user.email?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">
                    {user.user_metadata?.full_name || 'Kullanıcı'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 md:mt-2 w-full md:w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Menü</p>
                    </div>
                    <Link href="/dashboard" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" /> Panele Git
                    </Link>
                    <Link href="/dashboard/settings" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
                      <Settings className="w-4 h-4 text-slate-500" /> Ayarlar
                    </Link>
                    <button onClick={() => { signOut(); closeMenus(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors mt-1">
                      <LogOut className="w-4 h-4" /> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <Link 
                  href="/auth/login" 
                  onClick={closeMenus}
                  className="w-full md:w-auto text-sm font-medium text-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-2 md:px-4"
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="/auth/register" 
                  onClick={closeMenus}
                  className="w-full md:w-auto text-sm font-medium text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-6 transition-all shadow-[0_4px_20px_-5px_rgba(79,70,229,0.5)] active:scale-95"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Theme Selection (at bottom of menu) */}
      {isMenuOpen && isThemeMenuOpen && (
        <div className="mt-4 flex flex-col gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl md:hidden">
          <button onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <Sun className="w-4 h-4 text-orange-500" /> Açık Mod
          </button>
          <button onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <Moon className="w-4 h-4 text-indigo-400" /> Karanlık Mod
          </button>
          <button onClick={() => { setTheme('system'); setIsThemeMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <Monitor className="w-4 h-4 text-slate-400" /> Sistem Varsayılanı
          </button>
        </div>
      )}
    </nav>
  );
}
