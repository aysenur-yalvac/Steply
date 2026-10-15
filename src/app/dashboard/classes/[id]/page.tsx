export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import ClassDetailClient from "./ClassDetailClient";
import { Metadata } from "next";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Sınıf Detayı | Steply",
  description: "Sınıf ödevleri ve katılımcıları",
};

export default async function ClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const admin = createAdminClient();

  // 1. Supabase üzerinden ilgili id'ye sahip sınıfı çek (admin ile RLS kaynaklı 404 önlenir)
  const { data: classData, error: classError } = await admin
    .from("classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // Eğer sınıf bulunamazsa çökme veya generic 404 olmaması için log bas ve güvenli hata ekranı/yönlendirme sağla
  if (classError || !classData) {
    console.error("ClassDetailPage: Sınıf bulunamadı veya hata oluştu (ID:", id, "):", classError);
    return (
      <main className="min-h-[80vh] p-6 lg:p-12 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sınıf Bulunamadı</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Ulaşmaya çalıştığınız sınıf mevcut değil, silinmiş veya erişim adresiniz hatalı olabilir.
          </p>
          <Link
            href="/dashboard/classes"
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all w-full shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Sınıflarıma Dön
          </Link>
        </div>
      </main>
    );
  }

  // 2. Kullanıcının öğretmen mi yoksa sınıfa kayıtlı öğrenci mi olduğunu doğrula
  const isTeacher = user.id === classData.teacher_id;

  const { data: membership } = await admin
    .from("class_members")
    .select("id")
    .eq("class_id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  const isEnrolled = !!membership;

  if (!isTeacher && !isEnrolled) {
    console.warn("ClassDetailPage: Yetkisiz erişim denemesi (User:", user.id, "Class:", id, ")");
    return (
      <main className="min-h-[80vh] p-6 lg:p-12 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Erişim İzniniz Yok</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Bu sınıfın çalışma alanını görüntülemek için sınıfa kayıtlı öğrenci olmanız veya sınıf öğretmeni olmanız gerekmektedir.
          </p>
          <Link
            href="/dashboard/classes"
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all w-full shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Sınıflarıma Dön
          </Link>
        </div>
      </main>
    );
  }

  // 3. Sınıf öğretmen profilini çek
  const { data: teacherProfile } = await admin
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("id", classData.teacher_id)
    .maybeSingle();

  const clsWithTeacher = {
    ...classData,
    profiles: teacherProfile || { full_name: "Öğretmen", email: "" },
  };

  // 4. Bu sınıfa ait ödevleri çek
  const { data: rawAssignments, error: assignmentsError } = await admin
    .from("assignments")
    .select("*")
    .eq("class_id", id)
    .or("is_deleted.eq.false,is_deleted.is.null")
    .order("created_at", { ascending: false });

  if (assignmentsError) {
    console.error("ClassDetailPage: Ödevler getirilirken hata:", assignmentsError);
  }

  const assignments = (rawAssignments || []).map((a: any) => ({
    ...a,
    class: { name: classData.name },
    teacher: { full_name: teacherProfile?.full_name || "Öğretmen" },
  }));

  // 5. Bu sınıfa kayıtlı öğrencileri ve profillerini çek
  const { data: rawMembers, error: membersError } = await admin
    .from("class_members")
    .select("joined_at, student_id")
    .eq("class_id", id)
    .order("joined_at", { ascending: true });

  if (membersError) {
    console.error("ClassDetailPage: Katılımcılar getirilirken hata:", membersError);
  }

  const studentIds = (rawMembers || []).map((m: any) => m.student_id);
  const studentProfilesMap = new Map<string, any>();

  if (studentIds.length > 0) {
    const { data: profilesData } = await admin
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", studentIds);

    (profilesData || []).forEach((p: any) => studentProfilesMap.set(p.id, p));
  }

  const members = (rawMembers || []).map((m: any) => ({
    joined_at: m.joined_at,
    profiles: studentProfilesMap.get(m.student_id) || {
      id: m.student_id,
      full_name: "Öğrenci",
      email: "",
      avatar_url: null,
    },
  }));

  // 6. Öğretmen sınıfları (Ödev modalı sınıf seçimi için)
  const { data: teacherClasses } = isTeacher
    ? await admin.from("classes").select("id, name").eq("teacher_id", user.id).order("created_at", { ascending: false })
    : { data: [] };

  return (
    <ClassDetailClient
      cls={clsWithTeacher}
      assignments={assignments}
      members={members}
      isTeacher={isTeacher}
      teacherClasses={teacherClasses || []}
      userId={user.id}
    />
  );
}
