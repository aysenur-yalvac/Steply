import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import { School, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import SchoolStudentPanel, { type StudentRow } from '@/components/school/SchoolStudentPanel';
import TeacherGrid, { type TeacherRow } from '@/components/school/TeacherGrid';
import { sanitizeInstitution } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type PersonRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
  role: string | null;
  grade: string | null;
  school_number: string | null;
  school_email: string | null;
  phone_number: string | null;
  projectCount: number;
};


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

function SectionHeader({
  icon, label, count, iconBg, iconBorder, iconColor, countBg, countColor,
}: {
  icon: React.ReactNode; label: string; count: number;
  iconBg: string; iconBorder: string; iconColor: string;
  countBg: string; countColor: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className={`p-1.5 rounded-lg border ${iconBg} ${iconBorder}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h2 className="text-base font-bold text-slate-700">{label}</h2>
      <span
        className="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: countBg, color: countColor }}
      >
        {count}
      </span>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function buildPeopleRows(
  admin: ReturnType<typeof createAdminClient>,
  ids: string[],
  rawRows: any[],
): Promise<PersonRow[]> {
  if (ids.length === 0) return [];
  const { data: projectCounts } = await admin
    .from('projects')
    .select('student_id')
    .in('student_id', ids)
    .eq('is_private', false);
  const countMap: Record<string, number> = {};
  (projectCounts ?? []).forEach((r: any) => {
    countMap[r.student_id] = (countMap[r.student_id] ?? 0) + 1;
  });
  return rawRows.map((s: any) => ({
    id:            s.id,
    full_name:     s.full_name,
    avatar_url:    s.avatar_url,
    institution:   s.institution,
    role:          s.role ?? null,
    grade:         s.grade ?? null,
    school_number: s.school_number ?? null,
    school_email:  s.school_email ?? null,
    phone_number:  s.phone_number ?? null,
    projectCount:  countMap[s.id] ?? 0,
  }));
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function SchoolPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, institution')
    .eq('id', user.id)
    .single();

  // Guards against legacy bad data / free-typed input where an email address
  // ended up stored as the institution — never display or match on that.
  const institution = sanitizeInstitution(profile?.institution);
  const admin       = createAdminClient();

  // ── UNIFIED VIEW ─────────────────────────────────────────────────────────────
  let schoolStudents: PersonRow[] = [];
  let schoolTeachers: PersonRow[] = [];

  if (institution) {
    const { data: peers } = await admin
      .from('profiles')
      .select('id, full_name, avatar_url, institution, role, grade, school_number, school_email, phone_number')
      .ilike('institution', institution.trim())
      .neq('id', user.id);

    const students = (peers ?? []).filter((p: any) => p.role === 'student');
    const teachers = (peers ?? []).filter((p: any) => p.role === 'teacher');

    [schoolStudents, schoolTeachers] = await Promise.all([
      buildPeopleRows(admin, students.map((s: any) => s.id as string), students),
      buildPeopleRows(admin, teachers.map((t: any) => t.id as string), teachers),
    ]);
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader institution={institution} subtitle="okul topluluğun" />
      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-10">

        {institution && (
          <>
            <section>
              <SectionHeader
                icon={<UserCheck className="w-4 h-4" />} label="Öğretmenler" count={schoolTeachers.length}
                iconBg="bg-blue-50" iconBorder="border-blue-200" iconColor="text-blue-600"
                countBg="#DBEAFE" countColor="#2563EB"
              />
              {schoolTeachers.length === 0
                ? <EmptyState icon={<UserCheck className="w-6 h-6 text-slate-300" />} message="Okulundan kayıtlı öğretmen bulunamadı." />
                : <TeacherGrid teachers={schoolTeachers as TeacherRow[]} />}
            </section>

            <SchoolStudentPanel students={schoolStudents as StudentRow[]} />
          </>
        )}

        {!institution && <NoInstitutionNotice />}
      </div>
    </div>
  );
}

// ── Small sub-components ───────────────────────────────────────────────────────

function PageHeader({ institution, subtitle }: { institution: string | null; subtitle: string }) {
  return (
    <div
      className="relative overflow-hidden px-6 lg:px-10 pt-6 pb-8"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10 bg-white" />
      <div className="absolute bottom-0 left-1/3 w-72 h-32 rounded-full opacity-5 bg-white" />

      <div className="relative z-10">
        <div className="mb-4">
          <BackButton href="/dashboard" variant="light" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <School className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Okulum</p>
        </div>

        {institution ? (
          <>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
              {institution}
            </h1>
            <p className="mt-2 text-sm text-indigo-300 font-medium capitalize">{subtitle}</p>
          </>
        ) : (
          <h1 className="text-3xl font-extrabold text-white/60 tracking-tight">Henüz bir okul seçilmedi</h1>
        )}
      </div>
    </div>
  );
}

function NoInstitutionNotice() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 min-h-[200px] flex flex-col items-center justify-center gap-3 p-8">
      <School className="w-8 h-8 text-slate-300" />
      <p className="text-sm text-slate-500 font-medium">Henüz bir okul seçilmedi.</p>
      <p className="text-xs text-slate-400 text-center max-w-xs">
        Profil ayarlarından okul/kurum bilgini ekleyerek aynı okuldaki herkesi görebilirsin.
      </p>
      <Link href="/dashboard/settings" className="text-xs font-semibold text-violet-600 hover:underline mt-1">
        Ayarlara git →
      </Link>
    </div>
  );
}
