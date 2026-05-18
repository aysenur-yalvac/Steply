"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Globe, MapPin, GraduationCap, Medal } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Avatar } from "@/components/ui/avatar";
import { BadgeIcon } from "@/components/profile/BadgeDisplay";
import ActivityChartCard from "@/components/ui/activity-chart-card";
import type { LeaderboardEntry, ActivityDay } from "@/lib/actions";

const TABS = [
  { id: "global",      label: "🌍 Global Top 50",     icon: Globe },
  { id: "turkey",      label: "🇹🇷 Türkiye Top 50",   icon: MapPin },
  { id: "university",  label: "🎓 Üniversite Top 50",  icon: GraduationCap },
] as const;

type TabId = typeof TABS[number]["id"];

const RANK_STYLE: Record<number, { bg: string; text: string; ring: string; icon: string }> = {
  1: { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-400",   icon: "🥇" },
  2: { bg: "bg-slate-100",  text: "text-slate-600",   ring: "ring-slate-400",   icon: "🥈" },
  3: { bg: "bg-orange-50",  text: "text-orange-700",  ring: "ring-orange-400",  icon: "🥉" },
};

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLE[rank];
  if (style) {
    return (
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-base ${style.bg} ring-2 ${style.ring}`}>
        {style.icon}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-slate-500 bg-slate-50 ring-1 ring-slate-200">
      {rank}
    </span>
  );
}

function LeaderboardTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <Trophy className="w-10 h-10 opacity-20" />
        <p className="text-sm font-medium">Henüz sıralama verisi yok.</p>
        <p className="text-xs text-slate-300">Proje oluştur ve görev tamamla — sıralamana gir!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {entries.map((entry, i) => {
        const isMe = entry.id === currentUserId;
        const rowStyle = RANK_STYLE[entry.rank];
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02, type: "spring", stiffness: 300, damping: 28 }}
            className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
              isMe
                ? "bg-violet-50 border-l-2 border-violet-500"
                : rowStyle
                ? `${rowStyle.bg} hover:opacity-90`
                : "hover:bg-slate-50/70"
            }`}
          >
            {/* Rank */}
            <div className="shrink-0 w-10 flex justify-center">
              <RankBadge rank={entry.rank} />
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar src={entry.avatar_url} name={entry.full_name ?? "?"} size="sm" />
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${isMe ? "text-violet-700" : "text-slate-800"}`}>
                  {entry.full_name ?? "Anonymous"}
                  {isMe && <span className="ml-1.5 text-[10px] font-bold bg-violet-200 text-violet-700 px-1.5 py-0.5 rounded-full">Sen</span>}
                </p>
                {entry.university && (
                  <p className="text-[11px] text-slate-400 truncate">{entry.university}</p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              {(entry.badges ?? []).slice(0, 4).map(b => (
                <BadgeIcon key={b} badge={b} size="sm" />
              ))}
            </div>

            {/* Score */}
            <div className="shrink-0 text-right min-w-[72px]">
              <p className={`text-sm font-extrabold tabular-nums ${
                isMe
                  ? "text-violet-600"
                  : entry.rank <= 3
                  ? "text-amber-600"
                  : "text-slate-700"
              }`}>
                🏆 {entry.total_score.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">puan</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

interface Props {
  global50: LeaderboardEntry[];
  turkey50: LeaderboardEntry[];
  uni50: LeaderboardEntry[];
  currentUserId: string;
  userUniversity: string | null;
  currentUserRank: number;
  currentUserScore: number;
  activities: ActivityDay[];
}

export default function LeaderboardClient({
  global50,
  turkey50,
  uni50,
  currentUserId,
  userUniversity,
  currentUserRank,
  currentUserScore,
  activities,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("global");

  const entries =
    activeTab === "global"     ? global50 :
    activeTab === "turkey"     ? turkey50 :
    uni50;

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc]">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-6 lg:px-8 py-5 lg:pt-8 pb-0">
        <div className="mb-3">
          <BackButton href="/dashboard" variant="light" />
        </div>
        <p className="text-xs font-semibold text-slate-400 mb-1">
          Analytics <span className="text-slate-300 mx-1">›</span>
          <span className="text-slate-600">Leaderboard</span>
        </p>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 mb-5">
          Aktivite sıralaması ve rozet sistemi.
        </p>
      </div>

      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6">

        {/* Activity chart */}
        <ActivityChartCard activities={activities} totalScore={currentUserScore} className="rounded-2xl border-slate-100 shadow-sm" />

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 text-violet-600 mb-1">
              <Medal className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Global Sıran</span>
            </div>
            <p className="text-3xl font-black text-slate-800">
              {currentUserRank > 0 ? `#${currentUserRank}` : "—"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Toplam Puan</span>
            </div>
            <p className="text-3xl font-black text-slate-800">
              {currentUserScore.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Üniversite</span>
            </div>
            <p className="text-sm font-bold text-slate-700 truncate">
              {userUniversity ?? <span className="text-slate-400 font-normal">Belirtilmedi</span>}
            </p>
          </div>
        </div>

        {/* Leaderboard card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors shrink-0 border-b-2 ${
                  activeTab === tab.id
                    ? "border-violet-600 text-violet-700 bg-violet-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                {tab.id === "university" && !userUniversity && (
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full ml-1">
                    Üniversite ekle
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_auto_72px] gap-4 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kullanıcı</span>
            <span className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rozetler</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest text-right">Toplam Puan</span>
          </div>

          {/* Rows */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <LeaderboardTable entries={entries} currentUserId={currentUserId} />
            </motion.div>
          </AnimatePresence>

          {activeTab === "university" && !userUniversity && (
            <div className="px-5 py-4 border-t border-slate-100 bg-violet-50/40 text-sm text-violet-700 font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>
                Üniversite sıralamasını görmek için{" "}
                <a href="/dashboard/settings" className="underline font-bold">
                  Ayarlar → Profil
                </a>{" "}
                sayfasından üniversiteni ekle.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
