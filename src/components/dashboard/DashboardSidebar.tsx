"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart2,
  Bookmark,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import WatchlistDrawer from "@/components/dashboard/WatchlistDrawer";

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  role?: string;
  unreadCount?: number;
  isTeacher?: boolean;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "#", icon: BarChart2, disabled: true },
  { label: "Watchlist", href: "#watchlist", icon: Bookmark, isWatchlist: true },
  { label: "Calendar", href: "/dashboard/agenda", icon: Calendar },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavContent({
  userName,
  userEmail,
  role,
  unreadCount,
  isTeacher,
  onClose,
  onOpenWatchlist,
}: SidebarProps & { onClose: () => void; onOpenWatchlist: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col h-full select-none">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          onClick={onClose}
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/image_5.png"
              alt="Steply"
              className="w-9 h-9 object-cover scale-110"
              style={{ clipPath: "inset(2px)" }}
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">Steply</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Main Menu
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, isWatchlist, disabled }) => {
            const isActive =
              !isWatchlist &&
              !disabled &&
              (href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href));

            if (isWatchlist) {
              return (
                <button
                  key={label}
                  onClick={() => { onOpenWatchlist(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150"
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  {label}
                </button>
              );
            }

            if (disabled) {
              return (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 cursor-default"
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  {label}
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" strokeWidth={1.5} />}
              </Link>
            );
          })}
        </div>

        {/* Tools section */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mt-5 mb-2">
          Tools
        </p>
        <div className="space-y-0.5">
          <Link
            href="/dashboard/messages"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative ${
              pathname === "/dashboard/messages"
                ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Messages
            {(unreadCount || 0) > 0 && (
              <span className="ml-auto min-w-[20px] h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </Link>

          {!isTeacher && (
            <Link
              href="/dashboard/projects/new"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-violet-600 hover:bg-violet-50 transition-all duration-150"
            >
              <Plus className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              New Project
            </Link>
          )}
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-100">
        <Link
          href="/dashboard/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors mb-1"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AFF 0%, #A020F0 100%)" }}
          >
            {(userName || userEmail || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {userName || userEmail}
            </p>
            <p className="text-[10px] text-slate-500 capitalize font-medium">
              {role || "student"}
            </p>
          </div>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function DashboardSidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[70] p-2.5 rounded-xl bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-full overflow-hidden border-r border-white/60" style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <NavContent
          {...props}
          onClose={() => {}}
          onOpenWatchlist={() => setWatchlistOpen(true)}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[65] lg:hidden"
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 h-full w-72 shadow-2xl z-[70] lg:hidden border-r border-white/60"
              style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent
                {...props}
                onClose={() => setMobileOpen(false)}
                onOpenWatchlist={() => { setWatchlistOpen(true); setMobileOpen(false); }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <WatchlistDrawer isOpen={watchlistOpen} onClose={() => setWatchlistOpen(false)} />
    </>
  );
}
