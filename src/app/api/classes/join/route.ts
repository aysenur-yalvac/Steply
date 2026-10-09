import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await request.json();
  if (!code?.trim()) return NextResponse.json({ error: "Katılım kodu gereklidir." }, { status: 400 });

  const admin = createAdminClient();
  // Sinifi bul
  const { data: cls, error: clsErr } = await admin
    .from("classes")
    .select("id, name, teacher_id")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (clsErr || !cls) {
    return NextResponse.json({ error: "Geçersiz katılım kodu. Lütfen öğretmeninizden kodu alın." }, { status: 404 });
  }

  // Ogretmen kendi sinifina katilmasin
  if (cls.teacher_id === user.id) {
    return NextResponse.json({ error: "Kendi sınıfınıza katılamazsınız." }, { status: 400 });
  }

  // Zaten kayitli mi?
  const { data: existing } = await admin
    .from("class_members")
    .select("id")
    .eq("class_id", cls.id)
    .eq("student_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Bu sınıfa zaten kayıtlısınız." }, { status: 400 });
  }

  const { error: joinErr } = await supabase.from("class_members").insert({
    class_id: cls.id,
    student_id: user.id,
  });

  if (joinErr) return NextResponse.json({ error: joinErr.message }, { status: 500 });
  return NextResponse.json({ success: true, className: cls.name });
}
