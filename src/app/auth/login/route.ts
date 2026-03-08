import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?message=Giriş başarısız. Bilgilerinizi kontrol edip tekrar deneyin.`, {
      status: 301,
    });
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
    status: 301,
  });
}
