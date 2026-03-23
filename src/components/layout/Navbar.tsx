"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X, User, LogOut, Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import WatchlistDrawer from '@/components/dashboard/WatchlistDrawer';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [mounted, setMounted]           = useState(false);
  const pathname  = usePathname();
  const { user, signOut, loading } = useAuth();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const closeMenus = () => setIsMenuOpen(false);

  return (
    <nav
      className="w-full py-4 px-6 md:px-12 flex flex-col md:flex-row md:justify-between md:items-center sticky top-0 z-50"
      style={{
        background: "rgba(11,14,20,0.88)",
        borderBottom: "1px solid rgba(160,32,240,0.13)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      {/* Brand + mobile toggle */}
      <div className="flex justify-between items-center w-full md:w-auto">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          onClick={closeMenus}
        >
          <div className="w-7 h-7 relative overflow-hidden flex items-center justify-center rounded-sm">
            <img
              src="/image_5.png"
              alt="Steply Logo"
              className="w-8 h-8 max-w-none object-cover scale-110 drop-shadow-[0_0_10px_rgba(160,32,240,0.5)]"
              style={{ clipPath: "inset(2px)" }}
            />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Steply</span>
        </Link>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Nav links */}
      <div
        className={`${isMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center gap-5 mt-4 md:mt-0`}
      >
        {!loading && (
          <>
            {user ? (
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <Link
                  href="/dashboard"
                  className="w-full md:w-auto text-sm font-medium text-center text-slate-300 hover:text-white transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" /> Projects
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="w-full md:w-auto text-sm font-medium text-center text-slate-300 hover:text-white transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                  onClick={closeMenus}
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={() => { setIsWatchlistOpen(true); closeMenus(); }}
                  className="w-full md:w-auto text-sm font-medium text-center text-slate-300 hover:text-white transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-4 h-4" /> Watchlist
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full md:w-auto text-sm font-bold text-center text-slate-400 hover:text-red-400 transition-colors py-2 md:px-4 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                {!pathname.startsWith('/auth') && (
                  <Link
                    href="/auth/login"
                    onClick={closeMenus}
                    className="w-full md:w-auto text-sm font-semibold text-center text-slate-300 hover:text-white transition-colors py-2 md:px-5"
                  >
                    Log In
                  </Link>
                )}
                {!pathname.startsWith('/auth') && (
                  <Link
                    href="/auth/register"
                    onClick={closeMenus}
                    className="btn-aura w-full md:w-auto text-sm font-bold text-center text-white rounded-xl py-2.5 px-6 transition-all active:scale-95"
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <WatchlistDrawer isOpen={isWatchlistOpen} onClose={() => setIsWatchlistOpen(false)} />
    </nav>
  );
}
