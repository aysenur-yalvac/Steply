"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function UnreadMessagesBadge({ collapsed = false }: { collapsed?: boolean }) {
  const [count, setCount] = useState<number>(0);
  const supabase = createClient();

  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Sadece mevcut kullaniciya gelen ve okunmamis olan BENZERSIZ gonderici sayisi
    const { data } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (data) {
      const uniqueSenders = new Set(data.map((m) => m.sender_id)).size;
      setCount(uniqueSenders);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // 1. Tiklama/Okundu Event Dinleyicisi
    const handleCustomEvent = () => fetchUnreadCount();
    window.addEventListener("unread_chat_count_changed", handleCustomEvent);

    // 2. Supabase Realtime Dinleyicisi
    const channel = supabase
      .channel("sidebar_unread_messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      window.removeEventListener("unread_chat_count_changed", handleCustomEvent);
      supabase.removeChannel(channel);
    };
  }, []);

  if (count <= 0) return null;

  if (collapsed) {
    return (
      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full px-1 shadow-sm border border-white">
        {count > 9 ? "9+" : count}
      </span>
    );
  }

  return (
    <span className="ml-auto flex items-center justify-center min-w-[20px] h-[20px] bg-rose-500 text-white text-[11px] font-bold rounded-full px-1.5 shadow-sm border border-white/20">
      {count > 9 ? "9+" : count}
    </span>
  );
}
