"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, FileText, ArrowLeft, FolderPlus, Copy, Check, ShieldCheck, Calendar, UserCheck } from "lucide-react";
import AssignmentListClient from "@/components/assignments/AssignmentListClient";
import type { Assignment } from "@/lib/actions";
import CreateAssignmentModal from "@/components/assignments/CreateAssignmentModal";
import AssignmentDetailModal from "@/components/assignments/AssignmentDetailModal";

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
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cls.code) return;
    navigator.clipboard.writeText(cls.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/classes"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Sınıflarıma Dön
        </Link>

        {/* Header (Class Hub Info) */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-bl-full pointer-events-none -mr-10 -mt-10" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{cls.name}</h1>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800/60">
                  {members.length} Öğrenci
                </span>
              </div>

              {cls.description && (
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                  {cls.description}
                </p>
              )}

              {/* Meta details */}
              <div className="flex items-center gap-4 flex-wrap pt-1 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span>Öğretmen: <strong className="text-slate-700 dark:text-slate-200 font-medium">{cls.profiles?.full_name || "Öğretmen"}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500">&bull;</span>
                  <span>Katılım Kodu:</span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-300 tracking-wider">
                      {cls.code}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 dark:text-slate-400 hover:text-purple-600"
                      title="Katılım Kodunu Kopyala"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                      Kopyalandı!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons for Teacher */}
            {isTeacher && (
              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-indigo-500/20"
                >
                  <FolderPlus className="w-5 h-5" />
                  Bu Sınıfa Ödev Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-0">
        <button
          type="button"
          onClick={() => setActiveTab("assignments")}
          className={"flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl border-b-2 transition-all " + (
            activeTab === "assignments"
              ? "border-purple-600 text-purple-600 dark:border-purple-500 dark:text-white bg-purple-50/50 dark:bg-slate-800/50"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <FileText className="w-4 h-4" />
          Ödevler ({assignments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={"flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl border-b-2 transition-all " + (
            activeTab === "members"
              ? "border-purple-600 text-purple-600 dark:border-purple-500 dark:text-white bg-purple-50/50 dark:bg-slate-800/50"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          Katılımcılar ({members.length})
        </button>
      </div>

      {/* Tab 1: Ödevler (Assignments) */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/50 rounded-2xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Henüz ödev bulunmuyor</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mb-6">
                {isTeacher
                  ? "Bu sınıf için ilk ödevi oluşturarak öğrencilerinize teslim alanı açabilirsiniz."
                  : "Öğretmeniniz henüz bu sınıfa bir ödev tanımlamadı."}
              </p>
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm"
                >
                  <FolderPlus className="w-4 h-4" />
                  Bu Sınıfa İlk Ödevi Ekle
                </button>
              )}
            </div>
          ) : (
            <AssignmentListClient
              assignments={assignments}
              userRole={isTeacher ? "teacher" : "student"}
              teacherClasses={teacherClasses}
              defaultClassId={cls.id}
              hideHeader={true}
              onAssignmentClick={(assignment) => setSelectedAssignment(assignment)}
            />
          )}
        </div>
      )}

      {/* Tab 2: Katılımcılar (People) */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {/* Sınıf Öğretmeni Bölümü */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sınıf Öğretmeni</h3>
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800/40 shadow-sm">
              {cls.profiles?.avatar_url ? (
                <img
                  src={cls.profiles.avatar_url}
                  alt={cls.profiles.full_name || "Öğretmen"}
                  className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-purple-500/20"
                />
              ) : (
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold rounded-full flex items-center justify-center shrink-0 text-base">
                  {(cls.profiles?.full_name || "Ö").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {cls.profiles?.full_name || "Öğretmen"}
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Öğretmen
                  </span>
                </div>
                {cls.profiles?.email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{cls.profiles.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sınıf Öğrencileri Bölümü */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Kayıtlı Öğrenciler ({members.length})
              </h3>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
                  Henüz bu sınıfa katılan öğrenci yok
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-4">
                  Öğrencilerinizin bu sınıfa katılabilmesi için katılım kodunu paylaşın:
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-mono font-bold">
                  <span>{cls.code}</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded text-purple-600 dark:text-purple-300"
                    title="Kopyala"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((m: any, idx: number) => {
                  const p = m.profiles;
                  const joinDate = new Date(m.joined_at).toLocaleDateString("tr-TR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  });
                  const initials = (p?.full_name || p?.email || "ÖG").substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={p?.id || idx}
                      className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                      {p?.avatar_url ? (
                        <img
                          src={p.avatar_url}
                          alt={p.full_name || "Öğrenci"}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-full flex items-center justify-center shrink-0 text-sm">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate text-sm">
                          {p?.full_name || "Öğrenci"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p?.email || ""}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-400 block">{joinDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Detail & Submission / Grading Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          isTeacher={isTeacher}
          userId={userId}
          onClose={() => setSelectedAssignment(null)}
          onSubmissionSuccess={() => {
            // refresh
          }}
        />
      )}

      {/* Create Assignment Modal */}
      {isModalOpen && (
        <CreateAssignmentModal
          onClose={() => {
            setIsModalOpen(false);
            window.location.reload();
          }}
          teacherClasses={teacherClasses}
          defaultClassId={cls.id}
        />
      )}
    </div>
  );
}
