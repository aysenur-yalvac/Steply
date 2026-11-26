"use client";

import { useEffect, useState, useCallback } from "react";
import { getUnreadChatCountAction } from "@/lib/social-actions";
import { createClient } from "@/utils/supabase/client";

export default function UnreadMessagesBadge({ collapsed = false }: { collapsed?: boolean }) {
  const [count, setCount] = useState<number>(0);

  const loadCount = useCallback(async () => {
    try {
      const res = await getUnreadChatCountAction();
      setCount(res.count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadCount();

    const handleUpdate = () => {
      void loadCount();
    };
    window.addEventListener("unread_chat_count_changed", handleUpdate);

    const supabase = createClient();
    const channel = supabase
      .channel("sidebar-unread-messages-badge")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          void loadCount();
        }
      )
      .subscribe();

    const pollInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void loadCount();
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("unread_chat_count_changed", handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [loadCount]);

  if (count <= 0) return null;

  if (collapsed) {
    return (
      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full px-1 shadow-md border border-white z-50 shrink-0">
        {count > 9 ? "9+" : count}
      </span>
    );
  }

  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] bg-rose-500 text-white text-[11px] font-bold rounded-full px-1.5 shadow-md z-50 shrink-0">
      {count > 9 ? "9+" : count}
    </span>
  );
}
