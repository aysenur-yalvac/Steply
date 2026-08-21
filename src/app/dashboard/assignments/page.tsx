export const dynamic = 'force-dynamic';
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

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "student";
  
  // Dogrudan filtresiz tum odevleri cek
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('*, teacher:profiles!assignments_teacher_id_fkey(full_name)')
    .order('created_at', { ascending: false });

  // Eger veritabani okuma hatasi varsa KESINLIKLE GIZLEME, ekrana kirmizi kutuda bas!
  if (error) {
    return (
      <div className="p-8 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 max-w-5xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2">Veritabani Okuma Hatasi (SELECT Error):</h2>
        <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 lg:p-12 max-w-7xl mx-auto">
      <AssignmentListClient assignments={assignments || []} userRole={userRole} />
    </main>
  );
}
