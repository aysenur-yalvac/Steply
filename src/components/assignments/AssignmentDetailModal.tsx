"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  Award,
  AlertCircle,
  Loader2,
  MessageSquare,
  Check,
  File,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  submitAssignmentAction,
  getAssignmentSubmissionsAction,
  getStudentSubmissionAction,
  gradeSubmissionAction,
} from "@/lib/actions";
import type { Assignment, AssignmentSubmission } from "@/lib/actions";

interface AssignmentDetailModalProps {
  assignment: Assignment;
  isTeacher: boolean;
  userId: string;
  onClose: () => void;
  onSubmissionSuccess?: () => void;
}

export default function AssignmentDetailModal({
  assignment,
  isTeacher,
  userId,
  onClose,
  onSubmissionSuccess,
}: AssignmentDetailModalProps) {
  const isExpired = new Date() > new Date(assignment.due_date);
  const formattedDueDate = new Date(assignment.due_date).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ---- Student State ----
  const [studentSubmission, setStudentSubmission] = useState<AssignmentSubmission | null>(null);
  const [loadingStudentSub, setLoadingStudentSub] = useState(!isTeacher);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showResubmit, setShowResubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Teacher State ----
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(isTeacher);
  const [gradeInputs, setGradeInputs] = useState<{
    [submissionId: string]: { grade: string; feedback: string; saving: boolean; saved: boolean; error?: string };
  }>({});

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (isTeacher) {
        setLoadingSubmissions(true);
        const data = await getAssignmentSubmissionsAction(assignment.id);
        if (isMounted) {
          setSubmissions(data);
          const initialInputs: Record<string, { grade: string; feedback: string; saving: boolean; saved: boolean }> = {};
          data.forEach((sub) => {
            initialInputs[sub.id] = {
              grade: sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : "",
              feedback: sub.feedback || "",
              saving: false,
              saved: false,
            };
          });
          setGradeInputs(initialInputs);
          setLoadingSubmissions(false);
        }
      } else {
        setLoadingStudentSub(true);
        const sub = await getStudentSubmissionAction(assignment.id);
        if (isMounted) {
          setStudentSubmission(sub);
          setLoadingStudentSub(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [assignment.id, isTeacher]);

  // Handle file drop / selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const validExtensions = [".pdf", ".docx", ".doc", ".zip", ".rar"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      setUploadError("Geçersiz dosya formatı. Lütfen PDF, DOCX veya ZIP yükleyin.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError("Dosya boyutu çok büyük (Maksimum 25 MB).");
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
  };

  // Upload to Supabase Storage and Submit
  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    if (isExpired) {
      setUploadError("Süresi dolduğu için yeni dosya yüklenemez.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const supabase = createClient();
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${assignment.id}/${Date.now()}_${sanitizedName}`;

      // 1. Try assignment_files bucket first
      let uploadRes = await supabase.storage.from("assignment_files").upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });

      let bucketName = "assignment_files";

      // Fallback to assignments bucket
      if (uploadRes.error && uploadRes.error.message?.toLowerCase().includes("bucket not found")) {
        uploadRes = await supabase.storage.from("assignments").upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });
        bucketName = "assignments";
      }

      if (uploadRes.error) {
        throw new Error(uploadRes.error.message);
      }

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      // 3. Save submission in DB
      const res = await submitAssignmentAction(assignment.id, publicUrl, selectedFile.name);

      if ("error" in res) {
        throw new Error(res.error);
      }

      setStudentSubmission(res.submission);
      setSelectedFile(null);
      setShowResubmit(false);
      setUploadSuccess("Ödeviniz başarıyla teslim edildi!");

      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err?.message || "Dosya yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  // Teacher Grade Save Handler
  const handleSaveGrade = async (submissionId: string) => {
    const input = gradeInputs[submissionId];
    if (!input) return;

    const numGrade = Number(input.grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
      setGradeInputs((prev) => ({
        ...prev,
        [submissionId]: { ...prev[submissionId], error: "Not 0 ile 100 arasında olmalıdır." },
      }));
      return;
    }

    setGradeInputs((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], saving: true, error: undefined },
    }));

    const res = await gradeSubmissionAction(submissionId, numGrade, input.feedback);

    if (!res.success) {
      setGradeInputs((prev) => ({
        ...prev,
        [submissionId]: {
          ...prev[submissionId],
          saving: false,
          error: res.error || "Not kaydedilemedi.",
        },
      }));
    } else {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, grade: numGrade, feedback: input.feedback, status: "graded", graded_at: new Date().toISOString() }
            : s
        )
      );

      setGradeInputs((prev) => ({
        ...prev,
        [submissionId]: {
          ...prev[submissionId],
          saving: false,
          saved: true,
          error: undefined,
        },
      }));

      setTimeout(() => {
        setGradeInputs((prev) => ({
          ...prev,
          [submissionId]: { ...prev[submissionId], saved: false },
        }));
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800/60 uppercase tracking-wider">
                {assignment.course_name || "Genel"}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                  isExpired
                    ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                    : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                }`}
              >
                <Clock className="w-3 h-3" />
                {isExpired ? "Süresi Doldu" : "Devam Ediyor"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{assignment.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Son Teslim: <strong>{formattedDueDate}</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Assignment Description */}
          {assignment.description && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ödev Açıklaması</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {assignment.description}
              </p>
            </div>
          )}

          {/* ============================================================ */}
          {/* 👨🎓 ÖĞRENCİ GÖRÜNÜMÜ                                         */}
          {/* ============================================================ */}
          {!isTeacher && (
            <div className="space-y-5">
              {loadingStudentSub ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <span className="text-sm font-medium">Teslim durumunuz yükleniyor...</span>
                </div>
              ) : (
                <>
                  {/* Upload Success Alert */}
                  {uploadSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3 font-medium">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{uploadSuccess}</span>
                    </div>
                  )}

                  {/* 1. Zaten Teslim Edildiyse */}
                  {studentSubmission && !showResubmit ? (
                    <div className="space-y-4">
                      {/* Teslim Edildi Başlık Kartı */}
                      <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-base">
                                Ödev Teslim Edildi
                              </h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                                Tamamlandı
                              </span>
                            </div>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mt-0.5">
                              {new Date(studentSubmission.submitted_at).toLocaleString("tr-TR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {!isExpired && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowResubmit(true);
                              setSelectedFile(null);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors shadow-sm shrink-0"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Teslimi Güncelle
                          </button>
                        )}
                      </div>

                      {/* Teslim Edilen Dosya Kartı */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <File className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {studentSubmission.file_name}
                            </p>
                            <p className="text-xs text-slate-500">Yüklenen Dosya</p>
                          </div>
                        </div>

                        <a
                          href={studentSubmission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shrink-0 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          İndir
                        </a>
                      </div>

                      {/* Not Kartı (Öğretmen Değerlendirmesi) */}
                      {studentSubmission.grade !== null && studentSubmission.grade !== undefined ? (
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-semibold text-sm">
                              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              <span>Öğretmen Değerlendirmesi</span>
                            </div>
                            <div className="px-3.5 py-1 rounded-xl bg-purple-600 text-white font-bold text-lg shadow-sm">
                              {studentSubmission.grade} / 100
                            </div>
                          </div>

                          {studentSubmission.feedback && (
                            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/40 text-sm">
                              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 mb-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                Öğretmeninizin Notu:
                              </p>
                              <p className="text-slate-700 dark:text-slate-300 italic">
                                &ldquo;{studentSubmission.feedback}&rdquo;
                              </p>
                            </div>
                          )}

                          {studentSubmission.graded_at && (
                            <p className="text-[11px] text-slate-500 text-right">
                              Değerlendirildi:{" "}
                              {new Date(studentSubmission.graded_at).toLocaleDateString("tr-TR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5 font-medium">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Ödeviniz teslim edildi. Öğretmeniniz henüz notlandırmadı (Değerlendirme Bekliyor).</span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* 2. Henüz Teslim Edilmediyse VEYA Güncelleme Modundaysa */}
                  {(!studentSubmission || showResubmit) && (
                    <div className="space-y-4">
                      {showResubmit && (
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                            Yeni Dosya Seçerek Tesliminizi Güncelleyin
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowResubmit(false)}
                            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          >
                            Vazgeç
                          </button>
                        </div>
                      )}

                      {isExpired ? (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5 font-medium">
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <span>Bu ödevin son teslim tarihi dolmuştur. Artık dosya kabul edilmemektedir.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* File Dropzone */}
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragOver(true);
                            }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragOver(false);
                              handleFileSelect(e.dataTransfer.files);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                              isDragOver
                                ? "border-purple-500 bg-purple-500/10"
                                : selectedFile
                                ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                                : "border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 bg-slate-50/50 dark:bg-slate-900/40"
                            }`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.docx,.doc,.zip,.rar"
                              className="hidden"
                              onChange={(e) => handleFileSelect(e.target.files)}
                            />

                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                              <UploadCloud className="w-6 h-6" />
                            </div>

                            {selectedFile ? (
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedFile.name}</p>
                                <p className="text-xs text-slate-500">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Değiştirmek için tıklayın
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                  Dosyayı buraya sürükleyin veya tıklayarak seçin
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Desteklenen formatlar: <strong>PDF, DOCX, ZIP</strong> (Maks. 25 MB)
                                </p>
                              </div>
                            )}
                          </div>

                          {uploadError && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{uploadError}</span>
                            </div>
                          )}

                          {/* Submit Button */}
                          <button
                            type="button"
                            disabled={!selectedFile || uploading}
                            onClick={handleUploadSubmit}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Supabase Storage'a Yükleniyor...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-5 h-5" />
                                <span>Ödevi Teslim Et</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 👨🏫 ÖĞRETMEN GÖRÜNÜMÜ                                         */}
          {/* ============================================================ */}
          {isTeacher && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span>Öğrenci Teslimleri ({submissions.length})</span>
                </h3>
              </div>

              {loadingSubmissions ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <span className="text-sm font-medium">Teslimler yükleniyor...</span>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
                    Henüz teslim yapılmamış
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Öğrencileriniz bu ödeve dosya yüklediğinde teslimleri burada listelenecek ve notlandırılabilecektir.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => {
                    const inputState = gradeInputs[sub.id] || { grade: "", feedback: "", saving: false, saved: false };
                    const isGraded = sub.grade !== null && sub.grade !== undefined;

                    return (
                      <div
                        key={sub.id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                      >
                        {/* Student and file header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                              {(sub.student?.full_name || "Ö").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                {sub.student?.full_name || "Öğrenci"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {sub.student?.email || ""} &bull;{" "}
                                {new Date(sub.submitted_at).toLocaleString("tr-TR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1 ${
                                isGraded
                                  ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                  : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                              }`}
                            >
                              {isGraded ? (
                                <>
                                  <Award className="w-3.5 h-3.5" />
                                  Not: {sub.grade}/100
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5" />
                                  Notlandırılmadı
                                </>
                              )}
                            </span>

                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                              title="Dosyayı İndir"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="max-w-[120px] truncate">{sub.file_name}</span>
                            </a>
                          </div>
                        </div>

                        {/* Grading Form */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              Not (0 - 100)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="örn: 90"
                              value={inputState.grade}
                              onChange={(e) => {
                                const val = e.target.value;
                                setGradeInputs((prev) => ({
                                  ...prev,
                                  [sub.id]: { ...prev[sub.id], grade: val, error: undefined },
                                }));
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-semibold"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              Öğretmen Geribildirimi (Feedback)
                            </label>
                            <input
                              type="text"
                              placeholder="Öğrenciye not veya tavsiye yazın..."
                              value={inputState.feedback}
                              onChange={(e) => {
                                const val = e.target.value;
                                setGradeInputs((prev) => ({
                                  ...prev,
                                  [sub.id]: { ...prev[sub.id], feedback: val },
                                }));
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                          </div>

                          <div className="flex flex-col justify-end">
                            <button
                              type="button"
                              disabled={inputState.saving || inputState.grade === ""}
                              onClick={() => handleSaveGrade(sub.id)}
                              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              {inputState.saving ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Kaydediliyor...</span>
                                </>
                              ) : inputState.saved ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-300" />
                                  <span>Kaydedildi!</span>
                                </>
                              ) : (
                                <span>Notu Kaydet</span>
                              )}
                            </button>
                          </div>
                        </div>

                        {inputState.error && (
                          <p className="text-xs text-rose-500 font-medium">{inputState.error}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
