"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, MessageSquare, FolderOpen, Calendar, Check, CheckCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { markNotificationAsReadAction, markAllNotificationsReadAction } from "@/lib/actions";
import type { Notification } from "@/lib/actions";

function typeIcon(type: Notification["type"]) {
  if (type === "message") return <MessageSquare className="w-4 h-4 text-violet-500" />;
  if (type === "project") return <FolderOpen className="w-4 h-4 text-emerald-500" />;
  return <Calendar className="w-4 h-4 text-amber-500" />;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.is_read).length;

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await markNotificationAsReadAction(id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsReadAction();
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Bell className="w-8 h-8 mb-2 opacity-40" strokeWidth={1.5} />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                      n.is_read ? "opacity-60" : ""
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
                      {typeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.is_read ? "text-slate-500" : "text-slate-800 font-medium"}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{n.body}</p>
                      )}
                      <p className="text-xs text-slate-300 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
