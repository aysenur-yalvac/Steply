"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (pathname.startsWith('/dashboard') || pathname === '/') return null;

  const closeMenus = () => setIsMenuOpen(false);
  const isUserProfilePage = pathname.startsWith('/user/');

  return (
    <nav
      className="w-full py-4 px-6 md:px-12 flex flex-col md:flex-row md:justify-between md:items-center sticky top-0 z-50 transition-colors duration-200 bg-white/95 dark:bg-[#0b0e14]/95 md:bg-white/80 md:dark:bg-[#0b0e14]/90 border-b border-slate-200/80 dark:border-purple-900/30 md:backdrop-blur-xl"
    >
      {/* Brand + mobile toggle */}
      <div className="flex justify-between items-center w-full md:w-auto">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          onClick={closeMenus}
        >
          <div className="w-8 h-8 relative overflow-hidden flex items-center justify-center rounded-lg">
            <img
              src="/marka/logo.png"
              alt="Must-b Academy Logo"
              className="w-8 h-8 object-contain dark:hidden"
            />
            <img
              src="/marka/logo-dark.png"
              alt="Must-b Academy Logo"
              className="w-8 h-8 object-cover rounded-md hidden dark:block"
            />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">Must-b Academy</span>
        </Link>

        {!isUserProfilePage && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Nav links (hidden on /user/[id] profile view) */}
      {!isUserProfilePage && (
        <div
          className={`${isMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center gap-5 mt-4 md:mt-0`}
        >
          {!loading && (
            <>
              {user ? (
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                  <Link
                    href="/dashboard"
                    className="w-full md:w-auto text-sm font-semibold text-center text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white transition-colors py-2 md:px-4"
                    onClick={closeMenus}
                  >
                    Panel
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                  {!pathname.startsWith('/auth') && (
                    <Link
                      href="/auth/login"
                      onClick={closeMenus}
                      className="w-full md:w-auto text-sm font-semibold text-center text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white transition-colors py-2 md:px-5"
                    >
                      Giriş Yap
                    </Link>
                  )}
                  {!pathname.startsWith('/auth') && (
                    <Link
                      href="/auth/register"
                      onClick={closeMenus}
                      className="btn-aura w-full md:w-auto text-sm font-bold text-center text-white rounded-xl py-2.5 px-6 transition-all active:scale-95"
                    >
                      Kayıt Ol
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}

