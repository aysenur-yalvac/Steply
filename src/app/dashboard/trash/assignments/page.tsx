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
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard/trash/projects" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Projeler</Link>
        <Link href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Dosyalar</Link>
        <Link href="/dashboard/trash/assignments" className="px-4 py-2 border-b-2 border-violet-600 text-violet-600 font-medium">Odevler</Link>
      </div>
      <TrashAssignmentListClient assignments={assignments} />
    </div>
  );
}
