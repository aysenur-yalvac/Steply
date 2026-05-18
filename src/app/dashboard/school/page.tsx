import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import { School, UserCheck, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/back-button';

export const dynamic = 'force-dynamic';

type StudentRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
  projectCount: number;
};

export default async function SchoolPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, institution')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'teacher') redirect('/dashboard');

  const admin = createAdminClient();

  // Watched student IDs
  const { data: mentored } = await admin
    .from('mentored_projects')
    .select('project_id')
    .eq('teacher_id', user.id);

  let watchedStudentIds: string[] = [];
  if ((mentored ?? []).length > 0) {
    const projectIds = (mentored ?? []).map((r: any) => r.project_id as string);
    const { data: watchedProjects } = await admin
      .from('projects')
      .select('student_id')
      .in('id', projectIds);
    const unique = new Set((watchedProjects ?? []).map((r: any) => r.student_id as string));
    watchedStudentIds = [...unique];
  }

  // Students at the same institution (excluding teacher)
  const institution = profile?.institution ?? null;
  let schoolStudents: StudentRow[] = [];

  if (institution) {
    const { data: sameSchool } = await admin
      .from('profiles')
      .select('id, full_name, avatar_url, institution')
      .eq('institution', institution)
      .eq('role', 'student')
      .neq('id', user.id);

    if ((sameSchool ?? []).length > 0) {
      const ids = (sameSchool ?? []).map((s: any) => s.id as string);

      // Count public projects per student
      const { data: projectCounts } = await admin
        .from('projects')
        .select('student_id')
        .in('student_id', ids)
        .eq('is_private', false);

      const countMap: Record<string, number> = {};
      (projectCounts ?? []).forEach((r: any) => {
        countMap[r.student_id] = (countMap[r.student_id] ?? 0) + 1;
      });

      schoolStudents = (sameSchool ?? []).map((s: any) => ({
        id: s.id,
        full_name: s.full_name,
        avatar_url: s.avatar_url,
        institution: s.institution,
        projectCount: countMap[s.id] ?? 0,
      }));
    }
  }

  const watchedStudents = schoolStudents.filter((s) => watchedStudentIds.includes(s.id));
  const otherStudents   = schoolStudents.filter((s) => !watchedStudentIds.includes(s.id));

  // If watched student IDs have students not in school list (different institution), fetch them separately
  const watchedNotInSchool = watchedStudentIds.filter(
    (id) => !schoolStudents.some((s) => s.id === id)
  );
  let extraWatched: StudentRow[] = [];
  if (watchedNotInSchool.length > 0) {
    const { data: extra } = await admin
      .from('profiles')
      .select('id, full_name, avatar_url, institution')
      .in('id', watchedNotInSchool);

    if ((extra ?? []).length > 0) {
      const ids = (extra ?? []).map((s: any) => s.id as string);
      const { data: projectCounts } = await admin
        .from('projects')
        .select('student_id')
        .in('student_id', ids)
        .eq('is_private', false);
      const countMap: Record<string, number> = {};
      (projectCounts ?? []).forEach((r: any) => {
        countMap[r.student_id] = (countMap[r.student_id] ?? 0) + 1;
      });
      extraWatched = (extra ?? []).map((s: any) => ({
        id: s.id,
        full_name: s.full_name,
        avatar_url: s.avatar_url,
        institution: s.institution,
        projectCount: countMap[s.id] ?? 0,
      }));
    }
  }

  const allWatched = [...watchedStudents, ...extraWatched];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 lg:px-8 py-5 lg:pt-8 pb-5">
        <div className="mb-3">
          <BackButton href="/dashboard" variant="light" />
        </div>
        <p className="text-xs font-semibold text-slate-400 mb-1">
          Dashboard <span className="text-slate-300 mx-1">›</span>
          <span className="text-slate-600">Okulum</span>
        </p>
        <div className="flex items-center gap-3 mt-1">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
            <School className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Okulum</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {institution
                ? `${institution} · öğrenciler`
                : 'Okul bilgisi ayarlanmamış'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-10">

        {/* Section: Takip Ettiklerim */}
        <section>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-1.5 rounded-lg bg-violet-50 border border-violet-200">
              <UserCheck className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-base font-bold text-slate-700">Takip Ettiklerim</h2>
            <span className="text-xs font-extrabold w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
              {allWatched.length}
            </span>
          </div>

          {allWatched.length === 0 ? (
            <EmptyState icon={<UserCheck className="w-6 h-6 text-slate-300" />} message="Henüz takip ettiğin öğrenci yok." sub="Öğrenci profillerindeki Bookmark butonuyla projeleri takibe alabilirsin." />
          ) : (
            <StudentGrid students={allWatched} />
          )}
        </section>

        {/* Section: Okuldaki Diğer Öğrenciler */}
        {institution && (
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <Users className="w-4 h-4 text-slate-500" />
              </div>
              <h2 className="text-base font-bold text-slate-700">Okuldaki Diğer Öğrenciler</h2>
              <span className="text-xs font-extrabold w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                {otherStudents.length}
              </span>
            </div>

            {otherStudents.length === 0 ? (
              <EmptyState icon={<Users className="w-6 h-6 text-slate-300" />} message="Okulundan başka kayıtlı öğrenci bulunamadı." />
            ) : (
              <StudentGrid students={otherStudents} />
            )}
          </section>
        )}

        {!institution && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 min-h-[200px] flex flex-col items-center justify-center gap-3 p-8">
            <School className="w-8 h-8 text-slate-300" />
            <p className="text-sm text-slate-500 font-medium">Okul bilgisi bulunamadı.</p>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Profil ayarlarından okul/kurum bilgini ekleyerek aynı okuldaki öğrencileri görebilirsin.
            </p>
            <Link href="/dashboard/settings" className="text-xs font-semibold text-violet-600 hover:underline mt-1">
              Ayarlara git →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentGrid({ students }: { students: StudentRow[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {students.map((s) => (
        <Link
          key={s.id}
          href={`/user/${s.id}`}
          className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all flex items-center gap-4 p-4"
        >
          <Avatar src={s.avatar_url} name={s.full_name ?? '?'} size="md" className="w-11 h-11 text-base shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate group-hover:text-violet-700 transition-colors">
              {s.full_name ?? 'Öğrenci'}
            </p>
            {s.institution && (
              <p className="text-xs text-slate-400 truncate">{s.institution}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">
              {s.projectCount} public proje
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-violet-500 shrink-0 transition-colors" />
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub?: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 min-h-[160px] flex flex-col items-center justify-center gap-2 p-8">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <p className="text-sm text-slate-500 font-medium">{message}</p>
      {sub && <p className="text-xs text-slate-400 text-center max-w-xs">{sub}</p>}
    </div>
  );
}
