import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;
  
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
    return NextResponse.redirect(`${requestUrl.origin}/auth/register?message=Kayıt işlemi başarısız oldu. Email kullanımda olabilir.`, {
      status: 301,
    });
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
    status: 301,
  });
}
