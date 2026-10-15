export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import TeacherClasses from './TeacherClasses';
import StudentClasses from './StudentClasses';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sınıflarım | Steply',
};

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isTeacher = profile?.role === 'teacher';

  if (isTeacher) {
    // Fetch teacher's classes with student count
    const { data: classes } = await admin
      .from('classes')
      .select(`
        *,
        class_members (count)
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    return <TeacherClasses initialClasses={classes || []} />;
  } else {
    // Fetch student's enrolled classes
    const { data: memberships, error } = await admin
      .from('class_members')
      .select(`
        joined_at,
        classes (
          id,
          name,
          description,
          code,
          teacher_id
        )
      `)
      .eq('student_id', user.id)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error("ClassesPage: error fetching student classes:", error);
    }

    const validMemberships = (memberships || []).filter((m: any) => m.classes !== null);
    const teacherIds = Array.from(new Set(validMemberships.map((m: any) => m.classes?.teacher_id).filter(Boolean)));

    const { data: teacherProfiles } = teacherIds.length > 0
      ? await admin.from('profiles').select('id, full_name, email').in('id', teacherIds)
      : { data: [] };

    const teacherMap = new Map((teacherProfiles || []).map((t: any) => [t.id, t]));

    const formattedMemberships = validMemberships.map((m: any) => ({
      ...m,
      classes: {
        ...m.classes,
        profiles: teacherMap.get(m.classes.teacher_id) || { full_name: 'Öğretmen' }
      }
    }));

    return <StudentClasses initialMemberships={formattedMemberships} />;
  }
}
