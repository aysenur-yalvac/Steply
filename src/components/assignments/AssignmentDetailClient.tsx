"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, File, Lock, FileText, Download, ArrowLeft, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { submitAssignmentAction } from "@/lib/actions";
import { createClient } from "@/utils/supabase/client";
import type { Assignment, AssignmentSubmission } from "@/lib/actions";

export default function AssignmentDetailClient({
  assignment,
  submissions,
  userRole,
  userId,
}: {
  assignment: Assignment;
  submissions: AssignmentSubmission[];
  userRole: string;
  userId: string;
}) {
  const router = useRouter();
  const isTeacher = userRole === "teacher" || userRole === "ogretmen";
  
  // Check if expired
  const isExpired = new Date() > new Date(assignment.due_date);
  
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = new Date(assignment.due_date).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isExpired) {
      setError("Sure doldugu icin dosya yuklenemez.");
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${assignment.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('assignments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath);

      // Save submission to DB
      const res = await submitAssignmentAction(assignment.id, publicUrl, file.name);
      
      if ("error" in res) {
        throw new Error(res.error);
      }
      
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError("Dosya yuklenirken bir hata olustu: " + err.message);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // reset input
    }
  }

  // Format: [Orijinal Dosya Adı] - [Öğrenci Adı Soyadı] - [Saat:Dakika] - [GG.AA.YYYY]
  function renderSubmission(sub: AssignmentSubmission) {
    const d = new Date(sub.submitted_at);
    const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const studentName = sub.student?.full_name || "Bilinmeyen Ogrenci";
    
    return (
      <div key={sub.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-all">
              {sub.file_name} <span className="text-slate-500 font-normal mx-1">-</span> {studentName} <span className="text-slate-500 font-normal mx-1">-</span> <span className="text-slate-600 dark:text-slate-400">{time}</span> <span className="text-slate-500 font-normal mx-1">-</span> <span className="text-slate-600 dark:text-slate-400">{date}</span>
            </p>
          </div>
        </div>
        
        {isTeacher && (
          <a
            href={sub.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors shrink-0"
            title="Dosyayi Indir/Goruntule"
          >
            <Download className="w-5 h-5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Back Button */}
      <Link 
        href="/dashboard/assignments"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-400 transition-colors font-medium mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Odevlere Don
      </Link>

      {/* Assignment Info */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <FileText className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{assignment.title}</h1>
          <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed max-w-3xl mb-8">
            {assignment.description || "Bu odev icin aciklama girilmemis."}
          </p>
          
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${isExpired ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Son Teslim: {formattedDate}</span>
            </div>
            
            {assignment.teacher?.full_name && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Olusturan: <span className="text-slate-700 dark:text-slate-300">{assignment.teacher.full_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Zone (For Students) */}
      {!isTeacher && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Odev Yukle</h2>
          
          {isExpired ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <Lock className="w-12 h-12 text-rose-400 mb-3" />
              <h3 className="text-lg font-bold text-rose-400 mb-1">Yukleme Kilitli</h3>
              <p className="text-rose-400/80 max-w-md">
                🔒 Son teslim tarihi ve saati gectigi icin odev yuklemesi kapanmistir.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                onChange={handleFileUpload}
                disabled={uploading || isExpired}
              />
              
              {uploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
                  <h3 className="text-lg font-bold text-indigo-400 mb-1">Yukleniyor...</h3>
                  <p className="text-indigo-400/70">Lutfen bekleyin, dosyaniz gonderiliyor.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dosyanizi buraya surukleyin veya secin</h3>
                  <p className="text-slate-600 dark:text-slate-400">Yuklemek istediginiz dosyaya tiklayarak secebilirsiniz.</p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isTeacher ? "Tum Yuklemeler" : "Yukledigim Dosyalar"}
        </h2>
        
        {submissions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 text-center text-slate-500">
            {isTeacher ? "Henuz hicbir ogrenci dosya yuklemedi." : "Henuz bir dosya yuklemediniz."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {submissions.map(renderSubmission)}
          </div>
        )}
      </div>
    </div>
  );
}
