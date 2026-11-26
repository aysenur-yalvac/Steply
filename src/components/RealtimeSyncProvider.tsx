"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface RealtimeSyncProviderProps {
  userId: string;
  children: React.ReactNode;
}

export default function RealtimeSyncProvider({
  userId,
  children,
}: RealtimeSyncProviderProps) {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFocusRefreshRef = useRef<number>(0);

  const scheduleRouterRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      router.refresh();
    }, 300);
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`global-realtime-sync:${userId}`)
      // 1. Notifications (Bell & Invite notifications)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("notifications_updated", { detail: payload })
            );
          }
          scheduleRouterRefresh();
        }
      )
      // 2. Project Members / Invitations (Sent, Accepted, Declined, Removed)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_members",
        },
        (payload) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("project_members_updated", { detail: payload })
            );
            window.dispatchEvent(new Event("notifications_updated"));
          }
          scheduleRouterRefresh();
        }
      )
      // 3. Projects (Created, Updated, Completed, Deleted, Tags changed)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        (payload) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("projects_updated", { detail: payload })
            );
          }
          scheduleRouterRefresh();
        }
      )
      // 4. Project Tasks (Created, Assigned, Completed, Updated, Deleted)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_tasks",
        },
        (payload) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("project_tasks_updated", { detail: payload })
            );
          }
          scheduleRouterRefresh();
        }
      )
      // 5. Agenda Tasks (Personal agenda tasks)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agenda_tasks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("agenda_tasks_updated", { detail: payload })
            );
          }
          scheduleRouterRefresh();
        }
      )
      // 6. Direct Messages (Sidebar unread message badge)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("unread_chat_count_changed"));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${userId}`,
        },
        () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("unread_chat_count_changed"));
          }
        }
      )
      // 7. Project Activities & Teacher Reviews
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_activities",
        },
        () => {
          scheduleRouterRefresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
        },
        () => {
          scheduleRouterRefresh();
        }
      )
      .subscribe();

    // Sync when tab comes back to foreground (visibilitychange / focus)
    const handleVisibilityOrFocus = () => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      ) {
        return;
      }
      const now = Date.now();
      if (now - lastFocusRefreshRef.current < 1500) return;
      lastFocusRefreshRef.current = now;

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications_updated"));
        window.dispatchEvent(new Event("unread_chat_count_changed"));
      }
      scheduleRouterRefresh();
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      supabase.removeChannel(channel);
    };
  }, [userId, scheduleRouterRefresh]);

  return <>{children}</>;
}
