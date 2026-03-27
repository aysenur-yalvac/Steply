import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json([]);

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const { data, error } = await supabase
    .from("projects")
    .select("id, title")
    .ilike("title", `%${q}%`)
    .order("title")
    .limit(8);

  if (error) return NextResponse.json([], { status: 500 });

  return NextResponse.json(data ?? []);
}
