export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getDeletedAssignmentsAction } from "@/lib/actions";
import TrashAssignmentListClient from "@/components/assignments/TrashAssignmentListClient";
import Link from "next/link";

export const metadata = {
  title: "Silinen Odevler - Steply",
};

export default async function TrashAssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }
  
  let assignments: any[] = [];
  try {
    assignments = await getDeletedAssignmentsAction();
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="space-y-6">
      <TrashAssignmentListClient assignments={assignments} />
    </div>
  );
}
