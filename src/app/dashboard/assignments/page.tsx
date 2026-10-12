export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AssignmentListClient from "@/components/assignments/AssignmentListClient";

export const metadata = {
  title: "Odevler - Steply",
  description: "Odev klasorleri",
};

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "student";

  let assignments: any[] = [];

  if (userRole === "teacher") {
    // Ogretmen: kendi olusturdugu tum odevler
    const { data, error } = await supabase
      .from("assignments")
      .select(`*, teacher:profiles!assignments_teacher_id_fkey(full_name), class:classes(name)`)
      .eq("teacher_id", user.id)
      .or("is_deleted.eq.false,is_deleted.is.null")
      .order("created_at", { ascending: false });

    if (error) {
      return (
        <div className="p-8 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 max-w-5xl mx-auto mt-10">
          <h2 className="text-xl font-bold mb-2">Veritabani Okuma Hatasi:</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </div>
      );
    }
    assignments = data || [];

    // Ogretmenin kendi siniflari da fetch edilsin (modal icin)
    const { data: teacherClasses } = await supabase
      .from("classes")
      .select("id, name")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    return (
      <main className="min-h-screen p-6 lg:p-12 max-w-7xl mx-auto">
        <AssignmentListClient
          assignments={assignments}
          userRole={userRole}
          teacherClasses={teacherClasses || []}
        />
      </main>
    );
  } else {
    // Ogrenci: sadece kayitli oldugu siniflarin odevleri
    const { data: memberships } = await supabase
      .from("class_members")
      .select("class_id")
      .eq("student_id", user.id);

    const enrolledClassIds = (memberships || []).map((m: any) => m.class_id);

    if (enrolledClassIds.length === 0) {
      assignments = [];
    } else {
      const { data, error } = await supabase
        .from("assignments")
        .select(`*, teacher:profiles!assignments_teacher_id_fkey(full_name), class:classes(name)`)
        .in("class_id", enrolledClassIds)
        .or("is_deleted.eq.false,is_deleted.is.null")
        .order("created_at", { ascending: false });

      if (error) {
        return (
          <div className="p-8 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 max-w-5xl mx-auto mt-10">
            <h2 className="text-xl font-bold mb-2">Veritabani Okuma Hatasi:</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </div>
        );
      }
      assignments = data || [];
    }

    return (
      <main className="min-h-screen p-6 lg:p-12 max-w-7xl mx-auto">
        <AssignmentListClient
          assignments={assignments}
          userRole={userRole}
          teacherClasses={[]}
        />
      </main>
    );
  }
}
