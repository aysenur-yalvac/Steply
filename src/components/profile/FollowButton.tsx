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
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setErrMsg(null);

    const prev = state;
    // Optimistic update
    if (state === "following") {
      setState(isFollowedByTarget ? "followback" : "follow");
    } else {
      setState("following");
    }

    try {
      const result =
        prev === "following"
          ? await unfollowUserAction(targetId)
          : await followUserAction(targetId);

      if ("error" in result) {
        // Revert on failure
        setState(prev);
        setErrMsg(result.error);
        setTimeout(() => setErrMsg(null), 4000);
      }
    } catch {
      setState(prev);
      setErrMsg("Bir hata oluştu, tekrar dene.");
      setTimeout(() => setErrMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {state === "following" ? (
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
      ) : state === "followback" ? (
        <button
          onClick={handleClick}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 disabled:opacity-60"
        >
          <RefreshCw className="w-4 h-4" /> Geri Takip Et
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all border bg-[#7C3AFF] text-white border-[#7C3AFF] hover:bg-[#6d2ef5] disabled:opacity-60 shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Takip Et
        </button>
      )}
      {errMsg && (
        <p className="text-[11px] font-semibold text-red-500 max-w-[200px] text-right">
          {errMsg}
        </p>
      )}
    </div>
  );
}
