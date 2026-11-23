import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase();

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient();
      const { data: profileRow } = await admin
        .from("profiles")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      if (profileRow) {
        return NextResponse.json({ exists: true });
      }

      const { data: usersData, error: listErr } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (!listErr && usersData?.users) {
        const foundInAuth = usersData.users.some(
          (u) => (u.email || "").toLowerCase() === lowerEmail
        );
        return NextResponse.json({ exists: foundInAuth });
      }
    }

    const supabase = await createClient();
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    return NextResponse.json({ exists: !!profileRow });
  } catch (err) {
    console.error("[check-email] error:", err);
    return NextResponse.json({ exists: true });
  }
}
