"use client";

import { useState, useMemo } from "react";
import { X, Search, Users, MessageSquare, UserMinus } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { removeFollowerAction } from "@/lib/actions";
import type { FollowUser } from "@/lib/actions";

// ── Avatar preview strip ──────────────────────────────────────────────────────
function AvatarStack({ users, max = 4 }: { users: FollowUser[]; max?: number }) {
  const preview = users.slice(0, max);
  return (
    <div className="flex -space-x-2">
      {preview.map((u) => (
        <Avatar
          key={u.id}
          src={u.avatar_url}
          name={u.full_name ?? "?"}
          size="sm"
          className="w-7 h-7 text-[10px] ring-2 ring-white shrink-0"
        />
      ))}
    </div>
  );
}

// ── Follow modal ──────────────────────────────────────────────────────────────
function FollowModal({
  title,
  users,
  isFollowersView,
  onClose,
  onRemoveFollower,
}: {
  title: string;
  users: FollowUser[];
  isFollowersView: boolean;
  onClose: () => void;
  onRemoveFollower: (userId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => (u.full_name ?? "").toLowerCase().includes(q));
  }, [query, users]);

  async function handleRemove(userId: string) {
    setRemoving(userId);
    try {
      const result = await removeFollowerAction(userId);
      if (!("error" in result)) onRemoveFollower(userId);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,30,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="İsim ara…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <Users className="w-8 h-8 text-slate-200" />
              <p className="text-sm font-medium">Kimse bulunamadı.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <Avatar
                    src={u.avatar_url}
                    name={u.full_name ?? "?"}
                    size="sm"
                    className="w-9 h-9 text-sm shrink-0"
                  />
                  <Link
                    href={`/user/${u.id}`}
                    onClick={onClose}
                    className="flex-1 text-sm font-semibold text-slate-700 truncate hover:text-violet-700 transition-colors"
                  >
                    {u.full_name ?? "Steply Member"}
                  </Link>

                  {/* Message shortcut */}
                  <Link
                    href={`/dashboard/messages?userId=${u.id}`}
                    onClick={onClose}
                    title="Mesaj gönder"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>

                  {/* Remove follower (only in followers view) */}
                  {isFollowersView && (
                    <button
                      onClick={() => handleRemove(u.id)}
                      disabled={removing === u.id}
                      title="Takipçiyi çıkar"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-40"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main exported widget ──────────────────────────────────────────────────────
export default function SocialWidget({
  followers: initialFollowers,
  following,
}: {
  followers: FollowUser[];
  following: FollowUser[];
}) {
  const [followers, setFollowers] = useState(initialFollowers);
  const [modal, setModal] = useState<"followers" | "following" | null>(null);

  function handleRemoveFollower(userId: string) {
    setFollowers((prev) => prev.filter((u) => u.id !== userId));
  }

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Followers pill */}
        <button
          onClick={() => setModal("followers")}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-violet-300 hover:shadow-md transition-all"
        >
          {followers.length > 0 ? (
            <AvatarStack users={followers} />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-extrabold text-slate-800 leading-tight">
              {followers.length}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-tight">
              Takipçi
            </p>
          </div>
        </button>

        {/* Following pill */}
        <button
          onClick={() => setModal("following")}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-violet-300 hover:shadow-md transition-all"
        >
          {following.length > 0 ? (
            <AvatarStack users={following} />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-extrabold text-slate-800 leading-tight">
              {following.length}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-tight">
              Takip Edilen
            </p>
          </div>
        </button>
      </div>

      {modal === "followers" && (
        <FollowModal
          title={`Takipçiler · ${followers.length}`}
          users={followers}
          isFollowersView={true}
          onClose={() => setModal(null)}
          onRemoveFollower={handleRemoveFollower}
        />
      )}
      {modal === "following" && (
        <FollowModal
          title={`Takip Edilenler · ${following.length}`}
          users={following}
          isFollowersView={false}
          onClose={() => setModal(null)}
          onRemoveFollower={() => {}}
        />
      )}
    </>
  );
}
