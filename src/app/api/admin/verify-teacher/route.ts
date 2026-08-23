import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminProfile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const teacherId = formData.get("teacher_id") as string;

  if (!teacherId) return NextResponse.json({ error: "teacher_id required" }, { status: 400 });

  const { error } = await supabase
    .from("profiles")
    .update({ teacher_status: "verified" })
    .eq("id", teacherId)
    .eq("role", "teacher");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.redirect(
    new URL("/dashboard/admin/verifications", request.url),
    { status: 303 }
  );
}
