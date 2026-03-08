"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/auth/login?message=Giriş başarısız. Bilgilerinizi kontrol edip tekrar deneyin.");
  }

  return redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string; // 'student' or 'teacher'
  
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) {
    return redirect("/auth/register?message=Kayıt işlemi başarısız oldu. Email kullanımda olabilir.");
  }

  // Next.js de redirect yapınca kodun kalan kısmı çalışmaz, bu sebeple normal auth akışından sonra profile kayıt supabase db trigger'ına bırakıldı.
  // Gelen yanıta göre başarılıysa:
  return redirect("/dashboard");
}
