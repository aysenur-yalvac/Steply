"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText,
  BarChart2,
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
  Trash2,
} from "lucide-react";
import { removeLinkedAccountAction } from "@/lib/actions";
import type { LinkedAccount } from "@/lib/actions";
import { useRouter } from "next/navigation";
import {
  useAuth,
  getSavedLocalAccount,
  removeSavedLocalAccount,
  upsertSavedLocalAccount,
} from "@/context/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import UnreadMessagesBadge from "@/components/dashboard/UnreadMessagesBadge";
import toast from "react-hot-toast";

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  role?: string;
  unreadChatCount?: number;
  isTeacher?: boolean;
  avatarUrl?: string | null;
  linkedAccounts?: LinkedAccount[];
  userId?: string;
}

const NAV_ITEMS = [
  { label: "Projelerim", href: "/dashboard",            icon: LayoutDashboard },
  { label: "Analitik", href: "/dashboard/analytics",  icon: BarChart2 },
  { label: "Ajanda", href: "/dashboard/agenda",     icon: Calendar },
  { label: "Okulum",      href: "/dashboard/school",     icon: School },
  { label: "Mesajlar", href: "/dashboard/messages",   icon: MessageSquare },
  { label: "Ayarlar", href: "/dashboard/settings",   icon: Settings },
  { 
    label: "Çöp Kutusu", 
    href: "/dashboard/trash/projects",
    icon: Trash2,
    subItems: [
      { label: "Silinen Projeler", href: "/dashboard/trash/projects" },
      { label: "Silinen Dosyalar", href: "/dashboard/trash/files" },

    ]
  },
];

function AccountAvatar({ src, name, size = 32 }: { src?: string | null; name: string; size?: number }) {
  const px = `${size}px`;
  if (src) return <img src={src} alt="avatar" className="rounded-full object-cover shrink-0 pointer-events-none" style={{ width: px, height: px }} />;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 pointer-events-none"
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
  unreadChatCount,
  isTeacher,
  avatarUrl,
  linkedAccounts = [],
  userId,
  onClose,
  collapsed = false,
  onToggleExpand,
}: SidebarProps & {
  onClose: () => void;
  collapsed?: boolean;
  onToggleExpand?: () => void;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  const toggleMenu = (label: string) => setOpenMenus(p => ({...p, [label]: !p[label]}));
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [switchTarget, setSwitchTarget] = useState<LinkedAccount | null>(null);
  const [removeTarget, setRemoveTarget] = useState<LinkedAccount | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [accounts, setAccounts] = useState<LinkedAccount[]>(linkedAccounts);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [expiredSwitchEmail, setExpiredSwitchEmail] = useState<string | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Merge server linked accounts with any locally saved sessions in localStorage
  function mergeWithLocalSavedAccounts(serverAccounts: LinkedAccount[]): LinkedAccount[] {
    if (typeof window === "undefined") return serverAccounts;
    try {
      const raw = window.localStorage.getItem("saved_accounts");
      if (!raw) return serverAccounts;
      const localList = JSON.parse(raw);
      if (!Array.isArray(localList)) return serverAccounts;

      const merged = [...serverAccounts];
      const currentEmailLower = (userEmail || "").toLowerCase();

      for (const loc of localList) {
        if (!loc?.email) continue;
        const locEmailLower = String(loc.email).toLowerCase();
        if (loc.userId === userId || (currentEmailLower && locEmailLower === currentEmailLower)) {
          continue;
        }
        const exists = merged.some(
          (a) =>
            (a.linked_user_id && loc.userId && a.linked_user_id === loc.userId) ||
            (a.linked_email || "").toLowerCase() === locEmailLower
        );
        if (!exists) {
          merged.push({
            id: `local-${loc.userId || locEmailLower}`,
            linked_user_id: loc.userId || null,
            linked_email: loc.email,
            linked_name: loc.fullName || loc.email,
            linked_avatar: loc.avatarUrl || null,
          });
        }
      }
      return merged;
    } catch {
      return serverAccounts;
    }
  }

  // Refresh accounts from server — called on mount and each time dropdown opens.
  async function refreshAccounts() {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch('/api/auth/linked-accounts');
      if (res.ok) {
        const data: LinkedAccount[] = await res.json();
        setAccounts(mergeWithLocalSavedAccounts(data));
      } else {
        setAccounts(prev => mergeWithLocalSavedAccounts(prev));
      }
    } catch {
      setAccounts(prev => mergeWithLocalSavedAccounts(prev));
    } finally {
      setIsLoadingAccounts(false);
    }
  }

  // Sync initial server-provided accounts with localStorage on mount without a network call
  useEffect(() => {
    setAccounts(mergeWithLocalSavedAccounts(linkedAccounts));
  }, [linkedAccounts, userEmail, userId]);

  // Re-fetch in background when the user opens the dropdown
  useEffect(() => {
    if (isAccountMenuOpen) {
      setAccounts(prev => mergeWithLocalSavedAccounts(prev));
      void refreshAccounts();
    }
  }, [isAccountMenuOpen]);

  async function confirmRemoveAccount() {
    if (!removeTarget || isRemoving) return;
    setIsRemoving(true);
    removeSavedLocalAccount(removeTarget.linked_user_id, removeTarget.linked_email);
    if (!removeTarget.id.startsWith("local-")) {
      const result = await removeLinkedAccountAction(removeTarget.id);
      if ('error' in result) {
        setIsRemoving(false);
        toast.error(result.error || "Hesap bağlantısı kaldırılamadı.");
        return;
      }
    }
    setAccounts(prev => prev.filter(a => a.id !== removeTarget.id));
    setRemoveTarget(null);
    setIsRemoving(false);
    toast.success("Hesap listeden kaldırıldı.");
  }

  async function executeAccountSwitch(target: LinkedAccount) {
    if (isSwitching) return;
    setIsSwitching(true);
    setSwitchError(null);
    setExpiredSwitchEmail(null);

    const supabase = createClient();

    try {
      // Save current active account's tokens in localStorage before switching
      const { data: currentSessionData } = await supabase.auth.getSession();
      if (currentSessionData?.session) {
        upsertSavedLocalAccount(currentSessionData.session);
      }

      const savedLocal = getSavedLocalAccount(target.linked_user_id, target.linked_email);

      // Fast Path: If a valid refresh_token is already cached in localStorage, switch directly on the client
      // (@supabase/ssr browser client automatically updates SSR auth cookies on setSession!)
      if (savedLocal?.access_token && savedLocal?.refresh_token) {
        const { data: fastSetData, error: fastSetErr } = await supabase.auth.setSession({
          access_token: savedLocal.access_token,
          refresh_token: savedLocal.refresh_token,
        });
        if (!fastSetErr && fastSetData?.session) {
          upsertSavedLocalAccount(fastSetData.session);
          setSwitchTarget(null);
          setIsAccountMenuOpen(false);
          setIsSwitching(false);
          router.push('/dashboard');
          router.refresh();
          return;
        }
      }

      // Server Path: Request token refresh or admin magic-link verification
      const res = await fetch('/api/auth/switch-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linked_user_id: target.linked_user_id,
          linked_email: target.linked_email,
          refresh_token: savedLocal?.refresh_token,
        }),
      });

      const data = await res.json().catch(() => ({}));

      // If server returned fresh session tokens (and already set SSR cookies), sync client & soft-navigate
      if (res.ok && data?.session?.access_token && data?.session?.refresh_token) {
        const { data: setSessionRes, error: setErr } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (!setErr && setSessionRes?.session) {
          upsertSavedLocalAccount(setSessionRes.session);
        }
        setSwitchTarget(null);
        setIsAccountMenuOpen(false);
        setIsSwitching(false);
        router.push('/dashboard');
        router.refresh();
        return;
      }

      if (res.ok && data?.url && !String(data.url).includes('/auth/login')) {
        window.location.href = data.url;
        return;
      }

      // Session expired or could not be renewed — do NOT break current user's session!
      const expiredMsg = "Bu hesabın oturum süresi dolmuş, lütfen şifrenizle tekrar giriş yapın.";
      setSwitchError(expiredMsg);
      setExpiredSwitchEmail(target.linked_email || data?.email || "");
      toast.error(expiredMsg);
      setIsSwitching(false);
    } catch (e) {
      console.error('[switch-account] network error:', e);
      setSwitchError('Ağ hatası. İnternet bağlantınızı kontrol edin.');
      setIsSwitching(false);
    }
  }

  async function handleDirectSwitch(target: LinkedAccount) {
    await executeAccountSwitch(target);
  }

  async function confirmSwitch() {
    if (!switchTarget || isSwitching) return;
    await executeAccountSwitch(switchTarget);
  }

  async function handleSignOut(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const supabase = createClient();
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
    } catch {
      // ignore
    } finally {
      window.location.href = '/auth/login';
    }
  }

  return (
    <div className="flex flex-col h-full select-none">
      {/* Logo + toggle */}
      <div className={`border-b border-slate-100 dark:border-slate-800/80 ${collapsed ? "flex flex-col items-center gap-3 py-4 px-2" : "px-5 py-5"}`}>
        {collapsed ? (
          <>
            <Link href="/dashboard" prefetch={true} onClick={onClose} className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/marka/logo.png" alt="Must-b Academy" className="w-10 h-10 object-contain dark:hidden" /><img src="/marka/logo-dark.png" alt="Must-b Academy" className="w-10 h-10 object-cover rounded-lg hidden dark:block" />
            </Link>
            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                title="Genişlet"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-800 dark:hover:text-violet-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between">
            <Link href="/dashboard" prefetch={true} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <img src="/marka/logo.png" alt="Must-b Academy" className="w-9 h-9 object-contain dark:hidden" /><img src="/marka/logo-dark.png" alt="Must-b Academy" className="w-9 h-9 object-cover rounded-md hidden dark:block" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-slate-200">Must-b Academy</span>
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
      <nav className={`flex-1 py-4 overflow-y-auto ${collapsed ? "px-2 flex flex-col items-center" : "px-3"}`}>
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Ana Menü
          </p>
        )}
        <div className={collapsed ? "flex flex-col items-center gap-2 w-full" : "flex flex-col gap-2 w-full"}>
          {NAV_ITEMS.map((item) => {
              const { label, href, icon: Icon, subItems } = item as any;
              const isTeacherOnly = (item as any).teacherOnly;
              const isStudentOnly = (item as any).studentOnly;
              if (isTeacherOnly && !isTeacher) return null;
              if (isStudentOnly && isTeacher) return null;
              
              const isActive = (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));
              const isOpen = openMenus[label];


              

              if (subItems) {
                return (
                  <div key={label} className="w-full flex flex-col gap-1">
                    {collapsed ? (
                      <button
                        onClick={(e) => { e.preventDefault(); toggleMenu(label); if(href) { router.push(href); onClose?.(); } }}
                        title={label}
                        className={`relative w-10 h-10 flex items-center justify-center rounded-xl mx-auto transition-all duration-150 border ${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200 border-violet-600 dark:bg-violet-600 dark:text-white dark:border-violet-600" : isOpen ? "bg-violet-50 text-violet-700 border-violet-100 dark:bg-slate-800 dark:text-violet-400 dark:border-slate-700/80" : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}
                      >
                        <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.preventDefault(); toggleMenu(label); if(href) { router.push(href); onClose?.(); } }}
                        className={`relative w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border group ${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200 border-violet-600 dark:bg-violet-600 dark:text-white dark:border-violet-600" : isOpen ? "bg-violet-50 text-violet-700 border-violet-100 dark:bg-slate-800 dark:text-violet-400 dark:border-slate-700/80" : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : isOpen ? "text-violet-600 dark:text-violet-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white"}`} strokeWidth={isActive ? 2 : 1.5} />
                          <span>{label}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""} ${isActive ? "text-white" : "text-slate-400"}`} />
                      </button>
                    )}
                    {isOpen && !collapsed && (
                      <div className="flex flex-col gap-1 pl-9 pr-2 py-1">
                        {subItems.map((sub: any) => (
                          <Link key={sub.href} href={sub.href} prefetch={true} onClick={onClose} className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${pathname === sub.href ? "bg-violet-100 text-violet-800 border-violet-200 dark:bg-slate-800 dark:text-violet-400 dark:border-slate-700/80" : "text-slate-500 border-transparent hover:text-violet-700 hover:bg-violet-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}>
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                    {isOpen && collapsed && (
                      <div className="flex flex-col gap-1 items-center py-1">
                        {subItems.map((sub: any) => (
                          <Link key={sub.href} href={sub.href} prefetch={true} onClick={onClose} title={sub.label} className={`w-2 h-2 rounded-full transition-colors ${pathname === sub.href ? "bg-violet-600" : "bg-slate-300 hover:bg-violet-400"}`} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const isMessages = href === '/dashboard/messages' || label.toLowerCase().includes('message');
              
              return collapsed ? (
                <Link key={label} href={href} prefetch={true} onClick={onClose} title={label} className={`relative w-10 h-10 flex items-center justify-center rounded-xl mx-auto transition-all duration-150 border ${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200 border-violet-600 dark:bg-violet-600 dark:text-white dark:border-violet-600" : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}>
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                    {isMessages && <UnreadMessagesBadge collapsed={true} />}
                  </div>
                </Link>
              ) : (
                <Link key={label} href={href} prefetch={true} onClick={onClose} className={`relative w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border group ${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200 border-violet-600 dark:bg-violet-600 dark:text-white dark:border-violet-600" : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white"}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white"}`} strokeWidth={isActive ? 2 : 1.5} />
                    <span>{label}</span>
                  </div>
                  {isMessages && <UnreadMessagesBadge collapsed={false} />}
                </Link>
              );
            })}
            </div>

          </nav>

      {/* User footer */}
      <div className={`relative border-t border-slate-100 dark:border-slate-800/80 ${collapsed ? "p-2 flex flex-col items-center" : "p-3"}`}>

        {/* ============================================================
            POPOVER MENU — floats above footer, works in both modes
            Triggered by clicking active-profile button (below)
            ============================================================ */}
        {isAccountMenuOpen && (
          <>
            {/* Backdrop — click outside to close */}
            <div
              className="fixed inset-0 z-[99]"
              onClick={() => setIsAccountMenuOpen(false)}
            />

            {/* Popover panel */}
            <div className={`z-[100] bg-white dark:bg-[#0f172a] border border-slate-200 rounded-xl shadow-xl overflow-hidden w-64 ${
              collapsed
                ? 'fixed bottom-6 left-[72px]'   // collapsed: fixed to escape sidebar clip
                : 'absolute bottom-[calc(100%+8px)] left-0 right-0 w-auto' // expanded: opens above
            }`}>
              {/* Active account (header) */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-violet-50 border-b border-violet-100">
                <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} size={28} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-violet-800 truncate">{userName || userEmail}</p>
                  <p className="text-[10px] text-violet-500 capitalize">{role === "teacher" ? "Öğretmen" : (role === "admin" ? "Yönetici" : "Öğrenci")}</p>
                </div>
                <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
              </div>

              {/* Linked accounts */}
              {isLoadingAccounts && accounts.length === 0 && (
                <div className="px-3 py-2 text-[11px] text-slate-400 text-center">Yükleniyor...</div>
              )}
              {!isLoadingAccounts && accounts.length === 0 && (
                <div className="px-3 py-2 text-[11px] text-slate-400 text-center">Başka hesap bağlanılmamış</div>
              )}
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 group">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwitchError(null);
                      setExpiredSwitchEmail(null);
                      setSwitchTarget(acc);
                      setIsAccountMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <AccountAvatar src={acc.linked_avatar} name={acc.linked_name || acc.linked_email} size={28} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{acc.linked_name || acc.linked_email}</p>
                      <p className="text-[10px] text-slate-400 truncate">{acc.linked_email}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRemoveTarget(acc);
                      setIsAccountMenuOpen(false);
                    }}
                    className="shrink-0 opacity-80 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 text-slate-400 transition-all cursor-pointer"
                    title="Hesabı listeden kaldır"
                  >
                    <X className="w-3.5 h-3.5 pointer-events-none" />
                  </button>
                </div>
              ))}

              {/* Add account */}
              <button
                type="button"
                disabled={!userId}
                onClick={() => {
                  if (!userId) return;
                  document.cookie = `_steply_link_owner=${userId}; path=/; max-age=600; SameSite=Lax`;
                  window.location.replace(`/auth/login?link_account=true&owner_id=${userId}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 hover:text-violet-600 transition-colors border-t border-slate-100 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Hesap Ekle
              </button>
            </div>
          </>
        )}

        {/* ============================================================
            FOOTER CONTENT — only the active user + sign out
            ============================================================ */}
        {collapsed ? (
          /* Collapsed: single avatar button triggers popover */
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen(o => !o)}
              title={userName || userEmail || "Hesaplar"}
              className="flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-emerald-500 hover:ring-emerald-400 transition-all p-[2px]"
            >
              <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} size={32} />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              title="Çıkış Yap"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 pointer-events-none" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <>
            {/* Profile button + switcher toggle */}
            <div className="flex items-center gap-1 mb-1">
              <Link
                href="/dashboard/profile"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3 flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 transition-colors"
              >
                <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{userName || userEmail}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-300 capitalize font-medium">{role === 'teacher' ? 'Öğretmen' : role === 'admin' ? 'Yönetici' : 'Öğrenci'}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(o => !o)}
                className="shrink-0 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 transition-colors"
                title="Hesap değiştir"
              >
                <ChevronsUpDown className="w-4 h-4 pointer-events-none" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800/80 transition-all duration-150 cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0 pointer-events-none" strokeWidth={1.5} />
              <span className="pointer-events-none">Çıkış Yap</span>
            </button>
          </>
        )}
      </div>

      {/* Remove account confirmation modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Hesap Bağlantısını Kaldır</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-300">
                <span className="font-semibold text-slate-700">{removeTarget.linked_name || removeTarget.linked_email}</span>{" "}
                hesabının bağlantısını kaldırmak istediğinize emin misiniz? Bu işlem her iki hesaptaki hızlı geçiş menüsünden de bu hesabı kaldıracaktır.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { if (!isRemoving) setRemoveTarget(null); }}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmRemoveAccount}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-70"
              >
                {isRemoving ? "Kaldırılıyor..." : "Evet, Kaldır"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch account confirmation modal */}
      {switchTarget && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSwitching) {
              setSwitchTarget(null);
              setSwitchError(null);
              setExpiredSwitchEmail(null);
            }
          }}
        >
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">Hesap Değiştir</h3>
                <button
                  type="button"
                  onClick={() => {
                    const targetToRemove = switchTarget;
                    setSwitchTarget(null);
                    setSwitchError(null);
                    setExpiredSwitchEmail(null);
                    setRemoveTarget(targetToRemove);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Bu hesabı listeden kaldır"
                >
                  <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                  <span>Listeden Kaldır</span>
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-300">
                <span className="font-semibold text-slate-700 dark:text-slate-100">{switchTarget.linked_name || switchTarget.linked_email}</span>{" "}
                hesabına geçmek üzeresiniz.
              </p>
            </div>
            {switchError && (
              <div className="text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl px-3 py-2.5 space-y-2">
                <p>{switchError}</p>
                {expiredSwitchEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      if (userId) {
                        document.cookie = `_steply_link_owner=${userId}; path=/; max-age=600; SameSite=Lax`;
                        window.location.assign(
                          `/auth/login?link_account=true&owner_id=${encodeURIComponent(userId)}&email=${encodeURIComponent(expiredSwitchEmail)}`
                        );
                      } else {
                        window.location.assign(
                          `/auth/login?email=${encodeURIComponent(expiredSwitchEmail)}`
                        );
                      }
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Şifre ile Giriş Ekranını Aç ({expiredSwitchEmail})
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isSwitching) {
                    setSwitchTarget(null);
                    setSwitchError(null);
                    setExpiredSwitchEmail(null);
                  }
                }}
                disabled={isSwitching}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                disabled={isSwitching}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-70 cursor-pointer"
              >
                {isSwitching ? "Geçiş yapılıyor..." : "Geç"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function DashboardSidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Close expanded desktop sidebar when clicking outside, without any screen-blocking overlay
  useEffect(() => {
    if (!isExpanded) return;
    function handleOutsideMouseDown(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, [isExpanded]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-1.5 left-3 z-[70] min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/95 dark:bg-[#0f172a]/95 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        aria-label="Menüyü aç"
      >
        <Menu className="w-5 h-5 pointer-events-none" />
      </button>

      {/* Desktop sidebar - collapsible without any screen-blocking overlay or heavy blur.
          Clicking any empty area while collapsed expands the sidebar, while interactive links/buttons work directly. */}
      <aside
        ref={sidebarRef}
        onClick={(e) => {
          if (!isExpanded) {
            const target = e.target as HTMLElement;
            if (!target.closest("a, button, input, textarea, select, [role='button']")) {
              setIsExpanded(true);
            }
          }
        }}
        className={`hidden lg:flex flex-col shrink-0 h-full border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0f172a] transition-[width] duration-150 ease-out ${isExpanded ? 'w-64 relative z-30 cursor-default' : 'w-[72px] hover:bg-white dark:hover:bg-[#0f172a] relative z-30 cursor-pointer'}`}
      >
        <NavContent
          {...props}
          onClose={() => {}}
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 h-full w-[85vw] max-w-[320px] shadow-2xl z-[75] lg:hidden border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a]"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Menüyü kapat"
                className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent
                {...props}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


