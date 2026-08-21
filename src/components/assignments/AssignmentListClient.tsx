"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderPlus, Clock, ChevronRight, FileText } from "lucide-react";
import CreateAssignmentModal from "./CreateAssignmentModal";
import type { Assignment } from "@/lib/actions";

export default function AssignmentListClient({
  assignments,
  userRole,
}: {
  assignments: Assignment[];
  userRole: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isTeacher = userRole?.toLowerCase() === "teacher" || userRole?.toLowerCase() === "ogretmen";
  const [selectedCourse, setSelectedCourse] = useState<string>("Tumu");

  
  const courses = ["Tumu", ...Array.from(new Set(assignments.map(a => a.course_name || "Genel")))];
  const filteredAssignments = selectedCourse === "Tumu" 
    ? assignments 
    : assignments.filter(a => (a.course_name || "Genel") === selectedCourse);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Odevler</h1>
          <p className="text-slate-400 mt-1">Odev klasorlerini buradan yonetin ve goruntuleyin.</p>
        </div>
        
        {isTeacher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
          >
            <FolderPlus className="w-5 h-5" />
            <span>Yeni Odev Olustur</span>
          </button>
        )}
      </div>

      
      {/* Filters */}
      {assignments.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400 font-medium">Ders Filtresi:</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            {courses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* List */}

      {assignments.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Henuz odev bulunmuyor</h3>
          <p className="text-slate-400 max-w-sm">
            {isTeacher 
              ? "Ogrencileriniz icin yeni bir odev klasoru olusturarak baslayabilirsiniz."
              : "Ogretmenleriniz henuz bir odev klasoru olusturmamis."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAssignments.map((assignment) => {
            const isExpired = new Date() > new Date(assignment.due_date);
            const formattedDate = new Date(assignment.due_date).toLocaleString('tr-TR', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <Link 
                href={`/dashboard/assignments/${assignment.id}`}
                key={assignment.id}
                className="group relative bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all shadow-xl shadow-black/20 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      Suresi Doldu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      Devam Ediyor
                    </span>
                  )}
                </div>

                
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {assignment.title}
                </h3>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 mb-3 w-fit">
                  {assignment.course_name || "Genel"}
                </span>
                
                <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow">

                  {assignment.description || "Aciklama bulunmuyor."}
                </p>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
                  <div className="text-slate-400">
                    <span className="block text-xs text-slate-500 mb-0.5">Son Teslim</span>
                    <span className={`font-medium ${isExpired ? "text-rose-400/80" : "text-slate-300"}`}>
                      {formattedDate}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-indigo-500 flex items-center justify-center transition-colors text-slate-400 group-hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && <CreateAssignmentModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
