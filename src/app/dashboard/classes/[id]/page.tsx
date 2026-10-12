export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ClassDetailClient from "./ClassDetailClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sinif Detayi | Steply",
};

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTeacher = profile?.role === "teacher";

  // Fetch class
  const { data: cls, error: classError } = await supabase
    .from("classes")
    .select("*, profiles:teacher_id(full_name)")
    .eq("id", id)
    .single();

  if (classError || !cls) return notFound();

  // Check access
  if (isTeacher && cls.teacher_id !== user.id) return notFound();

  if (!isTeacher) {
    const { data: membership } = await supabase
      .from("class_members")
      .select("id")
      .eq("class_id", id)
      .eq("student_id", user.id)
      .single();
    if (!membership) return notFound();
  }

  // Fetch assignments for this class
  const { data: assignments } = await supabase
    .from("assignments")
    .select(`*, teacher:profiles!assignments_teacher_id_fkey(full_name), class:classes(name)`)
    .eq("class_id", id)
    .or("is_deleted.eq.false,is_deleted.is.null")
    .order("created_at", { ascending: false });

  // Fetch members
  const { data: members } = await supabase
    .from("class_members")
    .select("joined_at, profiles:student_id(id, full_name, email, avatar_url)")
    .eq("class_id", id)
    .order("joined_at", { ascending: true });

  // Fetch teacher's classes for the modal
  const { data: teacherClasses } = isTeacher
    ? await supabase.from("classes").select("id, name").eq("teacher_id", user.id)
    : { data: [] };

  return (
    <ClassDetailClient
      cls={cls}
      assignments={assignments || []}
      members={members || []}
      isTeacher={isTeacher}
      teacherClasses={teacherClasses || []}
      userId={user.id}
    />
  );
}
