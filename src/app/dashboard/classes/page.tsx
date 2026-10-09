import { createClient } from '@/utils/supabase/server';
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isTeacher = profile?.role === 'teacher';

  if (isTeacher) {
    // Fetch teacher's classes with student count
    const { data: classes } = await supabase
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
    const { data: memberships } = await supabase
      .from('class_members')
      .select(`
        joined_at,
        classes (
          id,
          name,
          description,
          code,
          profiles:teacher_id (full_name)
        )
      `)
      .eq('student_id', user.id)
      .order('joined_at', { ascending: false });

    return <StudentClasses initialMemberships={memberships || []} />;
  }
}
