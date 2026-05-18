"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleProjectFavoriteAction } from "@/lib/actions";

export default function FavoriteHeart({
  projectId,
  initialFavorited,
  size = "md",
}: {
  projectId: string;
  initialFavorited: boolean;
  size?: "sm" | "md";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    const prev = favorited;
    setFavorited(!prev);
    setLoading(true);
    try {
      const result = await toggleProjectFavoriteAction(projectId);
      if ("error" in result) setFavorited(prev);
    } catch {
      setFavorited(prev);
    } finally {
      setLoading(false);
    }
  }

  const iconCls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={favorited ? "Favorilerden çıkar" : "Favorile"}
      className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
        favorited
          ? "text-rose-500 bg-rose-50 border border-rose-200 hover:bg-rose-100"
          : "text-slate-400 hover:text-rose-400 hover:bg-rose-50"
      }`}
    >
      <Heart
        className={`${iconCls} transition-transform ${loading ? "scale-90" : "active:scale-125"}`}
        fill={favorited ? "currentColor" : "none"}
        strokeWidth={favorited ? 0 : 1.5}
      />
    </button>
  );
}
