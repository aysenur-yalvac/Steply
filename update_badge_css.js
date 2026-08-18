const fs = require('fs');

const content = `"use client";

import { useEffect, useState } from "react";
import { getUnreadChatCountAction } from "@/lib/social-actions";

export default function UnreadMessagesBadge({ collapsed = false }: { collapsed?: boolean }) {
  const [count, setCount] = useState<number>(0);

  const loadCount = async () => {
    const res = await getUnreadChatCountAction();
    console.log("=== [DEBUG BADGE COUNT] ===", res.count, "| ERROR:", res.error);
    setCount(res.count);
  };

  useEffect(() => {
    loadCount();

    const handleUpdate = () => loadCount();
    window.addEventListener("unread_chat_count_changed", handleUpdate);
    return () => window.removeEventListener("unread_chat_count_changed", handleUpdate);
  }, []);

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
`;

fs.writeFileSync('src/components/dashboard/UnreadMessagesBadge.tsx', content, 'utf8');
console.log("Updated UnreadMessagesBadge.tsx CSS and log");
