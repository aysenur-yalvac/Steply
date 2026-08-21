"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderPlus, Clock, ChevronRight, FileText, Trash2, Pencil } from "lucide-react";
import EditAssignmentModal from "./EditAssignmentModal";
import CreateAssignmentModal from "./CreateAssignmentModal";
import { softDeleteAssignmentAction } from "@/lib/actions";
import type { Assignment } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function AssignmentListClient({
  assignments,
  userRole,
}: {
  assignments: Assignment[];
  userRole: string;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const isTeacher = userRole?.toLowerCase() === "teacher" || userRole?.toLowerCase() === "ogretmen";
  const [selectedCourse, setSelectedCourse] = useState<string>("Tumu");
  const [selectedGrade, setSelectedGrade] = useState<string>("Tumu");
  
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>(assignments);
  
  useEffect(() => {
    setAssignmentsList(assignments);
  }, [assignments]);

  const courses = ["Tumu", ...Array.from(new Set(assignmentsList.map(a => a.course_name).filter(Boolean)))];
  const grades = ["Tumu", ...Array.from(new Set(assignmentsList.map(a => a.grade).filter(Boolean))).filter(g => g !== "Tumu")];

  const filteredAssignments = assignmentsList.filter(a => {
    const courseMatch = selectedCourse === "Tumu" || (a.course_name || "Genel") === selectedCourse;
    const gradeMatch = selectedGrade === "Tumu" || (a.grade || "Tumu") === selectedGrade;
    return courseMatch && gradeMatch;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Bu odev cop kutusuna tasinsin mi?')) return;

    const res = await softDeleteAssignmentAction(id);
    
    if (!res.success) {
      alert(`SILME BASARISIZ (DB HATASI): ${res.error}`);
      router.refresh();
    } else {
      setAssignmentsList(prev => prev.filter(item => item.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Odevler</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Odev klasorlerini buradan yonetin ve goruntuleyin.</p>
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
      {assignmentsList.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600 dark:text-slate-400 font-medium">Ders:</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
            >
              {courses.map(c => (
                <option key={c} value={c}>{c === "Tumu" ? "Tum Dersler" : c}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600 dark:text-slate-400 font-medium">Sinif:</label>
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
            >
              {grades.map(g => (
                <option key={g} value={g}>{g === "Tumu" ? "Tum Siniflar" : g}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* List */}
      {assignmentsList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Henuz odev bulunmuyor</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-sm">
            {isTeacher 
              ? "Ogrencileriniz icin yeni bir odev klasoru olusturarak baslayabilirsiniz."
              : "Ogretmenleriniz henuz bir odev klasoru olusturmamis."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredAssignments.map((assignment) => {
            const isExpired = new Date() > new Date(assignment.due_date);
            const formattedDate = new Date(assignment.due_date).toLocaleString('tr-TR', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
              <Link 
                href={`/dashboard/assignments/${assignment.id}`}
                key={assignment.id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {assignment.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 uppercase tracking-wider shrink-0">
                        {assignment.course_name || "Genel"}
                      </span>
                      {assignment.grade && assignment.grade !== "Tumu" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 uppercase tracking-wider shrink-0">
                          {assignment.grade}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                      {assignment.description || "Aciklama bulunmuyor."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Son Teslim</span>
                    <span className={`text-xs font-medium ${isExpired ? "text-rose-600 dark:text-rose-400/80" : "text-slate-700 dark:text-slate-300"}`}>
                      {formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1.5 ${
                      isExpired 
                        ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" 
                        : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      {isExpired ? "Suresi Doldu" : "Devam Ediyor"}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingAssignment(assignment);
                        }}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50 rounded-lg transition-all"
                        title="Odevi Duzenle"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, assignment.id)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/50 rounded-lg transition-all"
                        title="Cop Kutusuna Tasi"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 flex items-center justify-center transition-colors text-slate-400 group-hover:text-white shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && <CreateAssignmentModal onClose={() => setIsModalOpen(false)} />}
      {editingAssignment && <EditAssignmentModal assignment={editingAssignment} onClose={() => { setEditingAssignment(null); router.refresh(); }} />}
    </div>
  );
}

