const fs = require("fs");
const content = `import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getAssignmentByIdAction, getAssignmentSubmissionsAction } from "@/lib/actions";
import AssignmentDetailClient from "@/components/assignments/AssignmentDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const assignment = await getAssignmentByIdAction(resolvedParams.id);
  return {
    title: assignment ? \`\${assignment.title} - Steply\` : "Odev Detayi - Steply",
  };
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const assignmentId = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "student";
  
  const assignment = await getAssignmentByIdAction(assignmentId);
  if (!assignment) {
    redirect("/dashboard/assignments");
  }

  const submissions = await getAssignmentSubmissionsAction(assignmentId);

  return (
    <main className="min-h-screen p-6 lg:p-12 max-w-7xl mx-auto">
      <AssignmentDetailClient 
        assignment={assignment} 
        submissions={submissions} 
        userRole={userRole} 
        userId={user.id} 
      />
    </main>
  );
}`;

fs.writeFileSync("src/app/dashboard/assignments/[id]/page.tsx", content, "utf8");
