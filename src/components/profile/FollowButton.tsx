"use client";

import { useState } from "react";
import { UserPlus, UserCheck, UserMinus, RefreshCw } from "lucide-react";
import { followUserAction, unfollowUserAction } from "@/lib/actions";

type FollowState = "follow" | "followback" | "following";

export default function FollowButton({
  targetId,
  isFollowing,
  isFollowedByTarget,
}: {
  targetId: string;
  isFollowing: boolean;
  isFollowedByTarget: boolean;
}) {
  const initialState: FollowState = isFollowing
    ? "following"
    : isFollowedByTarget
    ? "followback"
    : "follow";

  const [state, setState] = useState<FollowState>(initialState);
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      if (state === "following") {
        await unfollowUserAction(targetId);
        setState(isFollowedByTarget ? "followback" : "follow");
      } else {
        await followUserAction(targetId);
        setState("following");
      }
    } finally {
      setLoading(false);
    }
  }

  if (state === "following") {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        disabled={loading}
        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all border disabled:opacity-60 ${
          hovering
            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            : "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        {hovering ? (
          <><UserMinus className="w-4 h-4" /> Takibi Bırak</>
        ) : (
          <><UserCheck className="w-4 h-4" /> Takip Ediliyor</>
        )}
      </button>
    );
  }

  if (state === "followback") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 disabled:opacity-60"
      >
        <RefreshCw className="w-4 h-4" /> Geri Takip Et
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all border bg-[#7C3AFF] text-white border-[#7C3AFF] hover:bg-[#6d2ef5] disabled:opacity-60 shadow-sm"
    >
      <UserPlus className="w-4 h-4" /> Takip Et
    </button>
  );
}
