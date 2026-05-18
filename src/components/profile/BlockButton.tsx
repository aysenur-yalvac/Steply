"use client";

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, ShieldOff, ShieldCheck, Loader2 } from "lucide-react";
import { blockUserAction, unblockUserAction } from "@/lib/actions";

export default function BlockButton({
  targetId,
  isBlocked: initialIsBlocked,
}: {
  targetId: string;
  isBlocked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(initialIsBlocked);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleToggle() {
    setOpen(false);
    setLoading(true);
    try {
      const result = blocked
        ? await unblockUserAction(targetId)
        : await blockUserAction(targetId);
      if (!("error" in result)) setBlocked((v) => !v);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        title="Daha fazla"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-30 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-44 overflow-hidden">
          <button
            onClick={handleToggle}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left transition-colors ${
              blocked
                ? "text-slate-700 hover:bg-slate-50"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            {blocked ? (
              <><ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" /> Engeli Kaldır</>
            ) : (
              <><ShieldOff className="w-4 h-4 shrink-0" /> Engelle</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
