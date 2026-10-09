import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "STP-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isTeacher = profile?.role === "teacher";

  let query;
  if (isTeacher) {
    // Ogretmen: kendi siniflarini + uye sayisi
    query = supabase
      .from("classes")
      .select("*, class_members(count)")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });
  } else {
    // Ogrenci: katildigi siniflar + ogretmen adi
    query = supabase
      .from("class_members")
      .select("class_id, joined_at, classes(id, name, description, code, teacher_id, created_at, profiles!teacher_id(full_name))")
      .eq("student_id", user.id)
      .order("joined_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ classes: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "teacher") {
    return NextResponse.json({ error: "Sadece öğretmenler sınıf oluşturabilir." }, { status: 403 });
  }

  const body = await request.json();
  const { name, description } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Sınıf adı zorunludur." }, { status: 400 });

  // Unique code uretelim
  const admin = createAdminClient();
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await admin.from("classes").select("id").eq("code", code).single();
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  const { data, error } = await supabase.from("classes").insert({
    teacher_id: user.id,
    name: name.trim(),
    description: description?.trim() || null,
    code,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ class: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const { error } = await supabase.from("classes").delete().eq("id", id).eq("teacher_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
