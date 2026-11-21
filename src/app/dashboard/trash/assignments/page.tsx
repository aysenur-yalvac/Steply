export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from "next/navigation";

export const metadata = {
  title: "Silinen Odevler - Academy.Must-b",
};

export default async function TrashAssignmentsPage() {
  redirect('/dashboard/trash/projects');
}

