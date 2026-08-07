"use client";

import { useState, useRef, useEffect } from "react";
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
  ChevronLeft,
  MessageSquare,
  Plus,
  ChevronsUpDown,
  Check,
  UserX,
  School,
  Heart,
} from "lucide-react";
import { removeLinkedAccountAction } from "@/lib/actions";
import type { LinkedAccount } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import WatchlistDrawer from "@/components/dashboard/WatchlistDrawer";

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  role?: string;
  unreadCount?: number;
  isTeacher?: boolean;
  avatarUrl?: string | null;
  linkedAccounts?: LinkedAccount[];
  userId?: string;
}

const NAV_ITEMS = [
  { label: "My Projects", href: "/dashboard",            icon: LayoutDashboard },
  { label: "Analytics",   href: "/dashboard/analytics",  icon: BarChart2 },
  { label: "Watchlist",   href: "#watchlist",             icon: Bookmark,  isWatchlist: true },
  { label: "Calendar",    href: "/dashboard/agenda",      icon: Calendar },
  { label: "Okulum",      href: "/dashboard/school",      icon: School,    teacherOnly: true  },
  { label: "Okulum",      href: "/dashboard/school",      icon: School,    studentOnly: true  },
  { label: "Favoriler",   href: "/dashboard/favorites",   icon: Heart,     teacherOnly: true  },
  { label: "Settings",    href: "/dashboard/settings",    icon: Settings },
];

function AccountAvatar({ src, name, size = 32 }: { src?: string | null; name: string; size?: number }) {
  const px = `${size}px`;
  if (src) return <img src={src} alt="avatar" className="rounded-full object-cover shrink-0" style={{ width: px, height: px }} />;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ width: px, height: px, background: "linear-gradient(135deg, #7C3AFF 0%, #A020F0 100%)" }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function NavContent({
  userName,
  userEmail,
  role,
  unreadCount,
  isTeacher,
  avatarUrl,
  linkedAccounts = [],
  userId,
  onClose,
  onOpenWatchlist,
  collapsed = false,
  onToggleExpand,
}: SidebarProps & {
  onClose: () => void;
  onOpenWatchlist: () => void;
  collapsed?: boolean;
  onToggleExpand?: () => void;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [switchTarget, setSwitchTarget] = useState<LinkedAccount | null>(null);
  const [removeTarget, setRemoveTarget] = useState<LinkedAccount | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [accounts, setAccounts] = useState<LinkedAccount[]>(linkedAccounts);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Refresh accounts from server â€” called on mount and each time dropdown opens.
  async function refreshAccounts() {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch('/api/auth/linked-accounts');
      if (res.ok) {
        const data: LinkedAccount[] = await res.json();
        setAccounts(data);
      }
    } catch {
      // silent â€” keep stale list
    } finally {
      setIsLoadingAccounts(false);
    }
  }

  // Fetch once on mount so the list is always fresh after page reload.
  useEffect(() => { refreshAccounts(); }, []);

  // Re-fetch every time the user opens the dropdown.
  useEffect(() => { if (isAccountMenuOpen) refreshAccounts(); }, [isAccountMenuOpen]);

  async function confirmRemoveAccount() {
    if (!removeTarget || isRemoving) return;
    setIsRemoving(true);
    const result = await removeLinkedAccountAction(removeTarget.id);
    if ('error' in result) {
      setIsRemoving(false);
      return;
    }
    setAccounts(prev => prev.filter(a => a.id !== removeTarget.id));
    setRemoveTarget(null);
    setIsRemoving(false);
  }

  async function confirmSwitch() {
    if (!switchTarget || isSwitching) return;

    if (!switchTarget.linked_user_id) {
      setSwitchError("Bu hesap iÃ§in kullanÄ±cÄ± ID'si bulunamadÄ±. HesabÄ± silip tekrar ekleyin.");
      return;
    }

    setIsSwitching(true);
    setSwitchError(null);

    try {
      const res = await fetch('/api/auth/switch-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linked_user_id: switchTarget.linked_user_id }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setSwitchError(data.error ?? 'Hesap geÃ§iÅŸi baÅŸarÄ±sÄ±z oldu. Tekrar deneyin.');
        setIsSwitching(false);
        return;
      }

      // Sign out without router.push side-effect (AuthContext.signOut redirects to '/'
      // which races with the magic link navigation below).
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = data.url;
    } catch (e) {
      console.error('[switch-account] network error:', e);
      setSwitchError('AÄŸ hatasÄ±. Ä°nternet baÄŸlantÄ±nÄ±zÄ± kontrol edin.');
      setIsSwitching(false);
    }
  }

  return (
    <div className="flex flex-col h-full select-none">
      {/* Logo + toggle */}
      <div className={`border-b border-slate-100 ${collapsed ? 'flex flex-col items-center gap-2 px-2 py-3' : 'px-5 py-5'}`}>
        {collapsed ? (
          <>
            <Link href="/dashboard" onClick={onClose} className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/image_5.png" alt="Steply" className="w-10 h-10 object-cover scale-110" style={{ clipPath: "inset(2px)" }} />
            </Link>
            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                title="GeniÅŸlet"
                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <img src="/image_5.png" alt="Steply" className="w-9 h-9 object-cover scale-110" style={{ clipPath: "inset(2px)" }} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800">Steply</span>
            </Link>
            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                title="Daralt"
                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 overflow-y-auto ${collapsed ? 'px-1' : 'px-3'}`}>
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Main Menu
          </p>
        )}
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const { label, href, icon: Icon } = item;
            const isWatchlist   = (item as any).isWatchlist  as boolean | undefined;
            const isTeacherOnly = (item as any).teacherOnly  as boolean | undefined;
            const isStudentOnly = (item as any).studentOnly  as boolean | undefined;
            if (isTeacherOnly && !isTeacher) return null;
            if (isStudentOnly &&  isTeacher) return null;
            const isActive =
              !isWatchlist &&
              (href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href));

            if (isWatchlist) {
              return collapsed ? (
                <button
                  key={label}
                  onClick={() => { onOpenWatchlist(); onClose(); }}
                  title={label}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150"
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                </button>
              ) : (
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

            return collapsed ? (
              <Link
                key={label}
                href={href}
                prefetch={true}
                onClick={onClose}
                title={label}
                className={`flex items-center justify-center py-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                key={label}
                href={href}
                prefetch={true}
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
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mt-5 mb-2">
            Tools
          </p>
        )}
        {collapsed && <div className="mt-3" />}
        <div className="space-y-0.5">
          {collapsed ? (
            <Link
              href="/dashboard/messages"
              prefetch={true}
              onClick={onClose}
              title="Messages"
              className={`relative flex items-center justify-center py-2.5 rounded-xl transition-all duration-150 ${
                pathname === "/dashboard/messages"
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {(unreadCount || 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </Link>
          ) : (
            <Link
              href="/dashboard/messages"
              prefetch={true}
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
          )}

          {!isTeacher && (
            collapsed ? (
              <Link
                href="/dashboard/projects/new"
                prefetch={true}
                onClick={onClose}
                title="New Project"
                className="flex items-center justify-center py-2.5 rounded-xl text-violet-500 hover:bg-violet-50 transition-all duration-150"
              >
                <Plus className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              </Link>
            ) : (
              <Link
                href="/dashboard/projects/new"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-violet-600 hover:bg-violet-50 transition-all duration-150"
              >
                <Plus className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                New Project
              </Link>
            )
          )}
        </div>
      </nav>

      {/* User footer */}
      <div className={`relative border-t border-slate-100 ${collapsed ? 'p-2' : 'p-3'}`}>

        {/* Account switcher dropdown â€” absolute so it floats above footer without shifting layout */}
        {isAccountMenuOpen && (
          <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[100]">
            {/* Current account */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-violet-50 border-b border-violet-100">
              <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} size={28} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-violet-800 truncate">{userName || userEmail}</p>
                <p className="text-[10px] text-violet-500 capitalize">{role || "student"}</p>
              </div>
              <Check className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            </div>

            {/* Linked accounts */}
            {isLoadingAccounts && accounts.length === 0 && (
              <div className="px-3 py-2 text-[11px] text-slate-400 text-center">YÃ¼kleniyorâ€¦</div>
            )}
            {!isLoadingAccounts && accounts.length === 0 && (
              <div className="px-3 py-2 text-[11px] text-slate-400 text-center">BaÄŸlÄ± hesap yok</div>
            )}
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 group">
                <button
                  type="button"
                  onClick={() => { setSwitchTarget(acc); setIsAccountMenuOpen(false); }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                >
                  <AccountAvatar src={acc.linked_avatar} name={acc.linked_name || acc.linked_email} size={28} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{acc.linked_name || acc.linked_email}</p>
                    <p className="text-[10px] text-slate-400 truncate">{acc.linked_email}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setRemoveTarget(acc); setIsAccountMenuOpen(false); }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"
                  title="BaÄŸlantÄ±yÄ± kaldÄ±r"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add account â€” redirect to login with owner_id for back-linking */}
            <button
              type="button"
              disabled={!userId}
              onClick={() => {
                if (!userId) return;
                // Cookie acts as the primary owner_id carrier so the login
                // route can pick it up even if hidden form inputs fail.
                document.cookie = `_steply_link_owner=${userId}; path=/; max-age=600; SameSite=Lax`;
                window.location.replace(`/auth/login?link_account=true&owner_id=${userId}`);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-violet-600 transition-colors border-t border-slate-100 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Hesap Ekle
            </button>
          </div>
        )}

        {collapsed ? (
          /* Collapsed footer: avatar + signout only */
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/dashboard/profile"
              onClick={onClose}
              title={userName || userEmail || "Profil"}
              className="rounded-full hover:ring-2 hover:ring-violet-400 transition-all"
            >
              <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} size={36} />
            </Link>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <>
            {/* Profile button + switcher toggle */}
            <div className="flex items-center gap-1 mb-1">
              <Link
                href="/dashboard/profile"
                onClick={onClose}
                className="flex items-center gap-3 flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{userName || userEmail}</p>
                  <p className="text-[10px] text-slate-500 capitalize font-medium">{role || "student"}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(o => !o)}
                className="shrink-0 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Hesap deÄŸiÅŸtir"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Remove account confirmation modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-extrabold text-slate-800">Hesap BaÄŸlantÄ±sÄ±nÄ± KaldÄ±r</h3>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{removeTarget.linked_name || removeTarget.linked_email}</span>{" "}
                hesabÄ±nÄ±n baÄŸlantÄ±sÄ±nÄ± kaldÄ±rmak istediÄŸinize emin misiniz? Bu iÅŸlem her iki hesaptaki hÄ±zlÄ± geÃ§iÅŸ menÃ¼sÃ¼nden de bu hesabÄ± kaldÄ±racaktÄ±r.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { if (!isRemoving) setRemoveTarget(null); }}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                VazgeÃ§
              </button>
              <button
                type="button"
                onClick={confirmRemoveAccount}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-70"
              >
                {isRemoving ? "KaldÄ±rÄ±lÄ±yor..." : "Evet, KaldÄ±r"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch account confirmation modal */}
      {switchTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-extrabold text-slate-800">Hesap DeÄŸiÅŸtir</h3>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{switchTarget.linked_name || switchTarget.linked_email}</span>{" "}
                hesabÄ±na geÃ§mek Ã¼zeresiniz. Mevcut oturumunuz kapatÄ±lacak.
              </p>
            </div>
            {switchError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {switchError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { if (!isSwitching) { setSwitchTarget(null); setSwitchError(null); } }}
                disabled={isSwitching}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Ä°ptal
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                disabled={isSwitching}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-70"
              >
                {isSwitching ? "GeÃ§iÅŸ yapÄ±lÄ±yor..." : "GeÃ§"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardSidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

      {/* Desktop sidebar â€” collapsible */}
      
      {/* Desktop overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar - collapsible */}
      <aside
        onClick={(e) => {
          if (!isExpanded) {
            setIsExpanded(true);
          }
        }}
        className={`hidden lg:flex flex-col shrink-0 h-full border-r border-white/60 transition-[width] duration-200 ease-in-out cursor-pointer ${isExpanded ? 'w-64 cursor-default relative z-50' : 'w-[72px] hover:bg-white/90 relative z-50'}`}
        style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <NavContent
          {...props}
          onClose={() => {}}
          onOpenWatchlist={() => setWatchlistOpen(true)}
          collapsed={!isExpanded}
          onToggleExpand={() => setIsExpanded(v => !v)}
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

