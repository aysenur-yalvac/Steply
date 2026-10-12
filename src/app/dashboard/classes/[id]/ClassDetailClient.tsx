"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, FileText, ArrowLeft, FolderPlus } from "lucide-react";
import AssignmentListClient from "@/components/assignments/AssignmentListClient";
import type { Assignment } from "@/lib/actions";
import CreateAssignmentModal from "@/components/assignments/CreateAssignmentModal";

type TabType = "assignments" | "members";

export default function ClassDetailClient({
  cls,
  assignments,
  members,
  isTeacher,
  teacherClasses,
  userId,
}: {
  cls: any;
  assignments: Assignment[];
  members: any[];
  isTeacher: boolean;
  teacherClasses: { id: string; name: string }[];
  userId: string;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("assignments");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/classes"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Sınıflarım
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{cls.name}</h1>
            {cls.description && <p className="text-slate-400 mt-1">{cls.description}</p>}
            <p className="text-slate-500 text-sm mt-1">
              Öğretmen: {cls.profiles?.full_name || "—"} &bull; Katılım Kodu: <span className="font-mono text-purple-300 font-semibold">{cls.code}</span>
            </p>
          </div>
          {isTeacher && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shrink-0"
            >
              <FolderPlus className="w-5 h-5" />
              Bu Sınıfa Ödev Ekle
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-0">
        <button
          onClick={() => setActiveTab("assignments")}
          className={"flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-all " + (
            activeTab === "assignments"
              ? "border-purple-500 text-white bg-slate-800/50"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <FileText className="w-4 h-4" />
          Ödevler ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={"flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-all " + (
            activeTab === "members"
              ? "border-purple-500 text-white bg-slate-800/50"
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          Katılımcılar ({members.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "assignments" && (
        <AssignmentListClient
          assignments={assignments}
          userRole={isTeacher ? "teacher" : "student"}
          teacherClasses={teacherClasses}
          defaultClassId={cls.id}
        />
      )}

      {activeTab === "members" && (
        <div className="space-y-3">
          {/* Teacher row */}
          <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-purple-500/30">
            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-purple-300 font-bold text-sm">Ö</span>
            </div>
            <div>
              <p className="font-semibold text-white">{cls.profiles?.full_name || "Öğretmen"}</p>
              <p className="text-xs text-purple-400 font-medium">Sınıf Öğretmeni</p>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Henüz bu sınıfa katılan öğrenci yok.</p>
              <p className="text-slate-500 text-sm mt-1">Katılım Kodu: <span className="font-mono text-purple-300 font-semibold">{cls.code}</span></p>
            </div>
          ) : (
            members.map((m) => {
              const p = m.profiles;
              const joinDate = new Date(m.joined_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
              const initials = (p?.full_name || p?.email || "?").substring(0, 2).toUpperCase();
              return (
                <div key={p?.id || m.joined_at} className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  {p?.avatar_url ? (
                    <img src={p.avatar_url} alt={p.full_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-slate-300 font-semibold text-sm">{initials}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{p?.full_name || "Öğrenci"}</p>
                    <p className="text-xs text-slate-500 truncate">{p?.email || ""}</p>
                  </div>
                  <p className="text-xs text-slate-500 shrink-0">{joinDate} tarihinde katıldı</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CreateAssignmentModal
          onClose={() => { setIsModalOpen(false); window.location.reload(); }}
          teacherClasses={teacherClasses}
          defaultClassId={cls.id}
        />
      )}
    </div>
  );
}
