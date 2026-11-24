"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, CheckCheck, X, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserNotificationsAndMessagesAction,
  markAllNotificationsAndMessagesReadAction,
  AppNotificationItem
} from "@/lib/social-actions";
import { markNotificationAsReadAction } from "@/lib/actions";
import { markMessagesAsReadAction } from "@/lib/social-actions";
import {
  acceptProjectInviteAction,
  declineProjectInviteAction,
} from "@/app/dashboard/actions";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa önce`;
  return `${Math.floor(h / 24)}g önce`;
}

export default function NotificationBell({
  initialNotifications = [],
  currentUserId,
}: {
  initialNotifications?: any[];
  currentUserId: string;
}) {
  const [items, setItems] = useState<AppNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications and messages
  const refreshNotifications = useCallback(async () => {
    try {
      const res = await getUserNotificationsAndMessagesAction();
      setItems(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("[NotificationBell] Failed to refresh:", err);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Supabase Realtime & custom window events for instant updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`bell-realtime:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        () => {
          refreshNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          refreshNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_members",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          refreshNotifications();
        }
      )
      .subscribe();

    function handleInviteHandled(e: Event) {
      const custom = e as CustomEvent<{
        projectId?: string;
        decision?: "accept" | "decline";
        projectTitle?: string;
      }>;
      const pid = custom.detail?.projectId;
      const decision = custom.detail?.decision;
      if (pid) {
        setItems((prev) => {
          let decremented = 0;
          const next = prev.map((i) => {
            const matchesProject =
              i.pendingProjectId === pid || (i.link && i.link.includes(pid));
            if (matchesProject) {
              if (!i.is_read) decremented += 1;
              return {
                ...i,
                is_read: true,
                pendingProjectId: null,
                title:
                  decision === "accept"
                    ? "Proje daveti kabul edildi"
                    : "Proje daveti reddedildi",
              };
            }
            return i;
          });
          if (decremented > 0) {
            setUnreadCount((c) => Math.max(0, c - decremented));
          }
          return next;
        });
      }
      refreshNotifications();
    }

    function handleNotificationsUpdated() {
      refreshNotifications();
    }

    window.addEventListener("project_invite_handled", handleInviteHandled);
    window.addEventListener("notifications_updated", handleNotificationsUpdated);
    window.addEventListener("unread_chat_count_changed", handleNotificationsUpdated);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("project_invite_handled", handleInviteHandled);
      window.removeEventListener("notifications_updated", handleNotificationsUpdated);
      window.removeEventListener("unread_chat_count_changed", handleNotificationsUpdated);
    };
  }, [currentUserId, refreshNotifications]);

  // Click outside and Escape key to close
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
    await markAllNotificationsAndMessagesReadAction();
    router.refresh();
  };

  const handleItemClick = (item: AppNotificationItem) => {
    if (!item.is_read) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_read: true } : i))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (item.id.startsWith("notif-")) {
        const rawId = item.id.replace(/^notif-/, "");
        markNotificationAsReadAction(rawId).catch(() => {});
      } else if (item.id.startsWith("msg-") && item.link.includes("userId=")) {
        const senderId = item.link.split("userId=")[1]?.split("&")[0];
        if (senderId) markMessagesAsReadAction(senderId).catch(() => {});
      }
    }
    setOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const handleInviteDecision = async (
    e: React.MouseEvent,
    item: AppNotificationItem,
    decision: "accept" | "decline"
  ) => {
    e.stopPropagation();
    const projectId = item.pendingProjectId;
    if (!projectId || inviteActionId) return;

    const prevItems = items;
    const prevUnread = unreadCount;

    // Optimistic UI update: immediately mark as read and clear pending buttons
    let wasUnread = false;
    setItems((prev) =>
      prev.map((i) => {
        if (i.pendingProjectId === projectId || (i.link && i.link.includes(projectId))) {
          if (!i.is_read) wasUnread = true;
          return {
            ...i,
            is_read: true,
            pendingProjectId: null,
            title:
              decision === "accept"
                ? "Proje daveti kabul edildi"
                : "Proje daveti reddedildi",
          };
        }
        return i;
      })
    );
    if (wasUnread || !item.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("project_invite_handled", {
          detail: { projectId, decision },
        })
      );
    }

    setInviteActionId(projectId);
    try {
      const res =
        decision === "accept"
          ? await acceptProjectInviteAction(projectId)
          : await declineProjectInviteAction(projectId);

      if ("error" in res) {
        setItems(prevItems);
        setUnreadCount(prevUnread);
        toast.error(res.error || "İşlem başarısız oldu.");
      } else {
        toast.success(
          decision === "accept"
            ? "Proje daveti kabul edildi!"
            : "Proje daveti reddedildi."
        );
        await refreshNotifications();
        router.refresh();
      }
    } catch {
      setItems(prevItems);
      setUnreadCount(prevUnread);
      toast.error("İşlem başarısız oldu.");
    } finally {
      setInviteActionId(null);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) refreshNotifications();
        }}
        className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-1.5rem))] sm:w-96 bg-white dark:bg-[#131722] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl dark:shadow-2xl z-50 overflow-hidden"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Bildirimler</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">
                    {unreadCount} yeni
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Tümünü Oku
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification & Message List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 [scrollbar-width:thin]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-2.5">
                    <Bell className="w-6 h-6 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Henüz yeni bildirimin yok.</p>
                  <p className="text-xs text-slate-400 mt-0.5">Mesajlar ve güncellemeler burada görünecektir.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleItemClick(item);
                      }
                    }}
                    className={`w-full flex items-start gap-3.5 px-4 py-3 text-left transition-colors cursor-pointer ${
                      item.is_read
                        ? "opacity-75 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        : "bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                    }`}
                  >
                    {/* Avatar / Icon */}
                    {item.sender_avatar ? (
                      <img
                        src={item.sender_avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 mt-0.5"
                      />
                    ) : item.sender_name ? (
                      <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-violet-700 dark:text-violet-300 font-bold text-xs mt-0.5 shadow-sm">
                        {item.sender_name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    )}

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm leading-snug ${
                        item.is_read
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-900 dark:text-slate-100 font-bold"
                      }`}>
                        {item.title}
                      </p>
                      {item.body && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.body}
                        </p>
                      )}
                      {item.pendingProjectId && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            disabled={inviteActionId === item.pendingProjectId}
                            onClick={(e) => handleInviteDecision(e, item, "accept")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold transition-colors disabled:opacity-50"
                          >
                            {inviteActionId === item.pendingProjectId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Kabul Et
                          </button>
                          <button
                            type="button"
                            disabled={inviteActionId === item.pendingProjectId}
                            onClick={(e) => handleInviteDecision(e, item, "decline")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Reddet
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {timeAgo(item.created_at)}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
