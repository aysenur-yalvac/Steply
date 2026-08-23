import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, ArrowLeft, FileText } from "lucide-react";

export default async function TeacherVerificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: pendingTeachers } = await supabase
    .from("profiles")
    .select("id, full_name, email, institution, institution_code, verification_doc_url, teacher_status, created_at")
    .eq("role", "teacher")
    .order("created_at", { ascending: false });

  const statusIcon = (status: string | null) => {
    if (status === "verified") return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "pending") return <Clock className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-slate-500" />;
  };

  const statusLabel = (status: string | null) => {
    if (status === "verified") return "Onaylandi";
    if (status === "pending") return "Beklemede";
    return "Dogrulanmadi";
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Ogretmen Dogrulama</h1>
          <p className="text-slate-400 text-sm mt-0.5">Bekleyen ogretmen hesaplari</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Beklemede", count: pendingTeachers?.filter(t => t.teacher_status === "pending").length ?? 0, color: "#FBBF24" },
          { label: "Onaylandi", count: pendingTeachers?.filter(t => t.teacher_status === "verified").length ?? 0, color: "#34D399" },
          { label: "Toplam", count: pendingTeachers?.length ?? 0, color: "#A020F0" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-3xl font-extrabold" style={{ color }}>{count}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Ogretmen", "Kurum", "Kurum Kodu", "Durum", "Belge", "Islemler"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(!pendingTeachers || pendingTeachers.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  Bekleyen ogretmen hesabi yok
                </td>
              </tr>
            )}
            {pendingTeachers?.map((teacher, i) => (
              <tr key={teacher.id}
                style={{ borderBottom: i < pendingTeachers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <td className="px-5 py-4">
                  <p className="text-white text-sm font-semibold">{teacher.full_name ?? "—"}</p>
                  <p className="text-slate-500 text-xs">{teacher.email ?? "—"}</p>
                </td>
                <td className="px-5 py-4 text-slate-300 text-sm">{teacher.institution ?? "—"}</td>
                <td className="px-5 py-4">
                  {teacher.institution_code ? (
                    <span className="px-2 py-1 rounded-md text-xs font-mono text-purple-300"
                      style={{ background: "rgba(160,32,240,0.1)" }}>
                      {teacher.institution_code}
                    </span>
                  ) : <span className="text-slate-600 text-xs">—</span>}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {statusIcon(teacher.teacher_status)}
                    <span className="text-sm text-slate-300">{statusLabel(teacher.teacher_status)}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {teacher.verification_doc_url ? (
                    <a href={teacher.verification_doc_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      <FileText className="w-3 h-3" />
                      Belgey Goruntule
                    </a>
                  ) : <span className="text-slate-600 text-xs">—</span>}
                </td>
                <td className="px-5 py-4">
                  {teacher.teacher_status !== "verified" && (
                    <form action={`/api/admin/verify-teacher`} method="POST">
                      <input type="hidden" name="teacher_id" value={teacher.id} />
                      <button type="submit"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80"
                        style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        Onayla
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
