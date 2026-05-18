"use client";

import { useState, useMemo } from "react";
import { X, Search, Users, MessageSquare, UserMinus, ArrowLeftRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { removeFollowerAction, unfollowUserAction } from "@/lib/actions";
import type { FollowUser } from "@/lib/actions";

// ── Avatar preview strip ──────────────────────────────────────────────────────
function AvatarStack({ users, max = 4 }: { users: FollowUser[]; max?: number }) {
  return (
    <div className="flex -space-x-2">
      {users.slice(0, max).map((u) => (
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

// ── Mutual-follow confirm dialog ──────────────────────────────────────────────
type ConfirmState = {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  /** "unfollow" = I stop following them  |  "remove" = they stop following me */
  mode: "unfollow" | "remove";
};

function MutualConfirmModal({
  confirm,
  loading,
  onSingle,
  onMutual,
  onCancel,
}: {
  confirm: ConfirmState;
  loading: boolean;
  onSingle: () => void;
  onMutual: () => void;
  onCancel: () => void;
}) {
  const isModeUnfollow = confirm.mode === "unfollow";

  const singleLabel = isModeUnfollow ? "Sadece Takibi Bırak" : "Sadece Çıkar";
  const singleDesc  = isModeUnfollow
    ? `Sen ${confirm.userName} kişisini takip etmeyi bırakırsın, o seni takip etmeye devam eder.`
    : `${confirm.userName} artık seni takip edemez, ama sen onu takip etmeye devam edersin.`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,30,0.70)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={confirm.avatarUrl}
              name={confirm.userName}
              size="md"
              className="w-11 h-11 shrink-0"
            />
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                Karşılıklı takip
              </p>
              <p className="text-base font-extrabold text-slate-800">{confirm.userName}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">{confirm.userName}</span> ile karşılıklı
            takipleşiyorsunuz. Ne yapmak istersiniz?
          </p>
        </div>

        {/* Options */}
        <div className="p-5 flex flex-col gap-3">
          {/* One-directional */}
          <button
            onClick={onSingle}
            disabled={loading}
            className="w-full flex items-start gap-3 px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-left disabled:opacity-50"
          >
            <UserMinus className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-800">{singleLabel}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{singleDesc}</p>
            </div>
          </button>

          {/* Both directions */}
          <button
            onClick={onMutual}
            disabled={loading}
            className="w-full flex items-start gap-3 px-4 py-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all text-left disabled:opacity-50"
          >
            {loading
              ? <Loader2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-spin" />
              : <ArrowLeftRight className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            }
            <div>
              <p className="text-sm font-bold text-red-700">Karşılıklı Takipten Çıkar</p>
              <p className="text-xs text-red-400 mt-0.5 leading-relaxed">
                Her iki yön de silinir — ikisi de birbirini takip etmez.
              </p>
            </div>
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Per-list modal ─────────────────────────────────────────────────────────────
function FollowModal({
  title,
  users,
  mutualIds,
  mode,
  actionLoadingId,
  onClose,
  onAction,
}: {
  title: string;
  users: FollowUser[];
  mutualIds: Set<string>;
  mode: "followers" | "following";
  actionLoadingId: string | null;
  onClose: () => void;
  onAction: (user: FollowUser) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) => (u.full_name ?? "").toLowerCase().includes(q));
  }, [query, users]);

  const btnTitle = mode === "followers" ? "Takipçiyi çıkar" : "Takibi bırak";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,15,30,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight: "82vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
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
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Users className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-medium">Kimse bulunamadı.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((u) => {
                const isMutual = mutualIds.has(u.id);
                const isLoading = actionLoadingId === u.id;

                return (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <Avatar
                      src={u.avatar_url}
                      name={u.full_name ?? "?"}
                      size="sm"
                      className="w-10 h-10 text-sm shrink-0"
                    />

                    {/* Name + mutual badge */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/user/${u.id}`}
                        onClick={onClose}
                        className="text-sm font-semibold text-slate-800 hover:text-violet-700 transition-colors truncate block"
                      >
                        {u.full_name ?? "Steply Member"}
                      </Link>
                      {isMutual && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-500 mt-0.5">
                          <ArrowLeftRight className="w-2.5 h-2.5" /> Karşılıklı
                        </span>
                      )}
                    </div>

                    {/* Message shortcut */}
                    <Link
                      href={`/dashboard/messages?userId=${u.id}`}
                      onClick={onClose}
                      title="Mesaj gönder"
                      className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors shrink-0"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>

                    {/* Remove / Unfollow */}
                    <button
                      onClick={() => onAction(u)}
                      disabled={isLoading}
                      title={btnTitle}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-40"
                    >
                      {isLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <UserMinus className="w-4 h-4" />
                      }
                    </button>
                  </li>
                );
              })}
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
  following: initialFollowing,
}: {
  followers: FollowUser[];
  following: FollowUser[];
}) {
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [modal, setModal]         = useState<"followers" | "following" | null>(null);
  const [confirm, setConfirm]     = useState<ConfirmState | null>(null);

  // Loading state: ID of the user whose action is in-flight (single or mutual)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const mutualIds = useMemo(() => {
    const followerSet  = new Set(followers.map((u) => u.id));
    const followingSet = new Set(following.map((u) => u.id));
    return new Set([...followerSet].filter((id) => followingSet.has(id)));
  }, [followers, following]);

  function pruneFollowers(id: string) { setFollowers((p) => p.filter((u) => u.id !== id)); }
  function pruneFollowing(id: string) { setFollowing((p) => p.filter((u) => u.id !== id)); }

  /** Called by FollowModal — decides whether to show confirm or act directly */
  function handleAction(user: FollowUser, listMode: "followers" | "following") {
    const actionMode: ConfirmState["mode"] = listMode === "following" ? "unfollow" : "remove";
    if (mutualIds.has(user.id)) {
      setConfirm({ userId: user.id, userName: user.full_name ?? "Bu kullanıcı", avatarUrl: user.avatar_url, mode: actionMode });
    } else {
      executeSingle(user.id, actionMode);
    }
  }

  async function executeSingle(userId: string, mode: "unfollow" | "remove") {
    setActionLoadingId(userId);
    try {
      if (mode === "unfollow") {
        const r = await unfollowUserAction(userId);
        if (!("error" in r)) pruneFollowing(userId);
        else console.error("[unfollow]", r.error);
      } else {
        const r = await removeFollowerAction(userId);
        if (!("error" in r)) pruneFollowers(userId);
        else console.error("[removeFollower]", r.error);
      }
    } finally {
      setActionLoadingId(null);
      setConfirm(null);
    }
  }

  async function executeMutual(userId: string) {
    setActionLoadingId(userId);
    try {
      const [r1, r2] = await Promise.all([
        unfollowUserAction(userId),
        removeFollowerAction(userId),
      ]);
      if ("error" in r1) console.error("[mutual unfollow]", r1.error);
      if ("error" in r2) console.error("[mutual remove]",   r2.error);
      // Prune from both lists regardless — server may have partially succeeded
      pruneFollowing(userId);
      pruneFollowers(userId);
    } finally {
      setActionLoadingId(null);
      setConfirm(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Followers pill */}
        <button
          onClick={() => setModal("followers")}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-violet-300 hover:shadow-md transition-all"
        >
          {followers.length > 0
            ? <AvatarStack users={followers} />
            : <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-slate-400" /></div>
          }
          <div className="text-left">
            <p className="text-sm font-extrabold text-slate-800 leading-tight">{followers.length}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-tight">Takipçi</p>
          </div>
        </button>

        {/* Following pill */}
        <button
          onClick={() => setModal("following")}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-violet-300 hover:shadow-md transition-all"
        >
          {following.length > 0
            ? <AvatarStack users={following} />
            : <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-slate-400" /></div>
          }
          <div className="text-left">
            <p className="text-sm font-extrabold text-slate-800 leading-tight">{following.length}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-tight">Takip Edilen</p>
          </div>
        </button>
      </div>

      {/* List modals */}
      {modal === "followers" && (
        <FollowModal
          title={`Takipçiler · ${followers.length}`}
          users={followers}
          mutualIds={mutualIds}
          mode="followers"
          actionLoadingId={actionLoadingId}
          onClose={() => setModal(null)}
          onAction={(u) => handleAction(u, "followers")}
        />
      )}
      {modal === "following" && (
        <FollowModal
          title={`Takip Edilenler · ${following.length}`}
          users={following}
          mutualIds={mutualIds}
          mode="following"
          actionLoadingId={actionLoadingId}
          onClose={() => setModal(null)}
          onAction={(u) => handleAction(u, "following")}
        />
      )}

      {/* Mutual confirm (z-60, above the list modal) */}
      {confirm && (
        <MutualConfirmModal
          confirm={confirm}
          loading={actionLoadingId === confirm.userId}
          onSingle={() => executeSingle(confirm.userId, confirm.mode)}
          onMutual={() => executeMutual(confirm.userId)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
