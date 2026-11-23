import { redirect } from "next/navigation";
import { getCachedUser, getCachedProfile } from "@/lib/auth-cache";
import { getAssignmentByIdAction, getAssignmentSubmissionsAction } from "@/lib/actions";
import AssignmentDetailClient from "@/components/assignments/AssignmentDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const assignment = await getAssignmentByIdAction(resolvedParams.id);
  return {
    title: assignment ? `${assignment.title} | Must-b Academy` : "Ödev Detayı | Must-b Academy",
  };
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id: assignmentId }, user] = await Promise.all([params, getCachedUser()]);

  if (!user) {
    redirect("/auth/login");
  }

  // Parallel fetch: cached profile, assignment details, and submissions
  const [profile, assignment, submissions] = await Promise.all([
    getCachedProfile(),
    getAssignmentByIdAction(assignmentId),
    getAssignmentSubmissionsAction(assignmentId),
  ]);

  if (!assignment) {
    redirect("/dashboard/classes");
  }

  const userRole = profile?.role || "student";

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
      <AssignmentDetailClient
        assignment={assignment}
        submissions={submissions}
        userRole={userRole}
        userId={user.id}
      />
    </main>
  );
}
