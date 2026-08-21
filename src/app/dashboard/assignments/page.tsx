import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getAssignmentsAction } from "@/lib/actions";
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
  let assignments: any[] = [];
  try {
    assignments = await getAssignmentsAction();
  } catch (error) {
    console.error("Page level error fetching assignments:", error);
  }

  return (
    <main className="min-h-screen p-6 lg:p-12 max-w-7xl mx-auto">
      <AssignmentListClient assignments={assignments} userRole={userRole} />
    </main>
  );
}
