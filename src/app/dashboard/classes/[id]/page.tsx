export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCachedUser } from "@/lib/auth-cache";
import ClassDetailClient from "./ClassDetailClient";
import { Metadata } from "next";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Sınıf Detayı | Must-b Academy",
  description: "Sınıf ödevleri ve katılımcıları",
};

export default async function ClassDetailPage({ params }: PageProps) {
  const [{ id }, user] = await Promise.all([params, getCachedUser()]);

  if (!user) {
    redirect("/auth/login");
  }

  const admin = createAdminClient();

  // Round 1: Fetch class, membership check, assignments, and class members in parallel
  const [classRes, membershipRes, assignmentsRes, rawMembersRes] = await Promise.all([
    admin
      .from("classes")
      .select("id, name, description, code, teacher_id, created_at")
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("class_members")
      .select("id")
      .eq("class_id", id)
      .eq("student_id", user.id)
      .maybeSingle(),
    admin
      .from("assignments")
      .select("id, title, description, course_name, due_date, class_id, teacher_id, created_at, is_deleted")
      .eq("class_id", id)
      .or("is_deleted.eq.false,is_deleted.is.null")
      .order("created_at", { ascending: false }),
    admin
      .from("class_members")
      .select("joined_at, student_id")
      .eq("class_id", id)
      .order("joined_at", { ascending: true }),
  ]);

  const classData = classRes.data;
  if (classRes.error || !classData) {
    console.error("ClassDetailPage: Sınıf bulunamadı veya hata oluştu (ID:", id, "):", classRes.error);
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

  const isTeacher = user.id === classData.teacher_id;
  const isEnrolled = !!membershipRes.data;

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

  const rawMembers = rawMembersRes.data || [];
  const profileIdsToFetch = Array.from(
    new Set([classData.teacher_id, ...rawMembers.map((m: any) => m.student_id)].filter(Boolean))
  );

  // Round 2: Fetch teacher + all student profiles in ONE query, in parallel with teacherClasses
  const [profilesRes, teacherClassesRes] = await Promise.all([
    profileIdsToFetch.length > 0
      ? admin.from("profiles").select("id, full_name, email, avatar_url").in("id", profileIdsToFetch)
      : Promise.resolve({ data: [] }),
    isTeacher
      ? admin.from("classes").select("id, name").eq("teacher_id", user.id).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map<string, any>();
  (profilesRes.data || []).forEach((p: any) => profileMap.set(p.id, p));

  const teacherProfile = profileMap.get(classData.teacher_id);
  const clsWithTeacher = {
    ...classData,
    profiles: teacherProfile || { full_name: "Öğretmen", email: "" },
  };

  const assignments = (assignmentsRes.data || []).map((a: any) => ({
    ...a,
    class: { name: classData.name },
    teacher: { full_name: teacherProfile?.full_name || "Öğretmen" },
  }));

  const members = rawMembers.map((m: any) => ({
    joined_at: m.joined_at,
    profiles: profileMap.get(m.student_id) || {
      id: m.student_id,
      full_name: "Öğrenci",
      email: "",
      avatar_url: null,
    },
  }));

  return (
    <ClassDetailClient
      cls={clsWithTeacher}
      assignments={assignments}
      members={members}
      isTeacher={isTeacher}
      teacherClasses={teacherClassesRes.data || []}
      userId={user.id}
    />
  );
}
