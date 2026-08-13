import { redirect } from "next/navigation";

export default function TrashRedirect() {
  redirect("/dashboard/trash/projects");
}
