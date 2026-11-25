import { Suspense } from 'react';
import { getCachedUser, getCachedProfile } from '@/lib/auth-cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import { School, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import SchoolStudentPanel, { type StudentRow } from '@/components/school/SchoolStudentPanel';
import TeacherGrid, { type TeacherRow } from '@/components/school/TeacherGrid';
import { sanitizeInstitution } from '@/lib/utils';
import SchoolLoading from './loading';

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
    <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 dark:border-slate-800 bg-white dark:bg-slate-900 dark:bg-slate-900/60 min-h-[160px] flex flex-col items-center justify-center gap-2 p-8">
      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:border-slate-800 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{message}</p>
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
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center dark:bg-slate-800 dark:border dark:border-slate-700/80 shrink-0 ${iconBg} ${iconBorder}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h2 className="text-base font-bold text-slate-700">{label}</h2>
      <span className="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center dark:!bg-slate-800 dark:!text-slate-100 dark:!border dark:!border-slate-700/80" style={{ background: countBg, color: countColor }}>
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

async function SchoolPageContent() {
  const [user, profile] = await Promise.all([
    getCachedUser(),
    getCachedProfile(),
  ]);
  if (!user) redirect('/auth/login');

  // Guards against legacy bad data / free-typed input where an email address
  // ended up stored as the institution — never display or match on that.
  const currentUserUniversity = sanitizeInstitution(
    (profile as any)?.university || profile?.institution
  );
  const currentUserDepartment =
    typeof (profile as any)?.department === 'string' && (profile as any).department.trim()
      ? (profile as any).department.trim()
      : null;

  const hasSchoolAndDepartment = Boolean(currentUserUniversity && currentUserDepartment);
  const admin = createAdminClient();

  // ── UNIFIED VIEW (Strictly filtered by both university AND department) ───────
  let schoolStudents: PersonRow[] = [];
  let schoolTeachers: PersonRow[] = [];

  if (hasSchoolAndDepartment && currentUserUniversity && currentUserDepartment) {
    const { data: peers } = await admin
      .from('profiles')
      .select('id, full_name, avatar_url, institution, university, department, role, grade, school_number, school_email, phone_number')
      .eq('university', currentUserUniversity)
      .eq('department', currentUserDepartment)
      .neq('id', user.id);

    const students = (peers ?? []).filter((p: any) => p.role === 'student');
    const teachers = (peers ?? []).filter((p: any) => p.role === 'teacher');

    [schoolStudents, schoolTeachers] = await Promise.all([
      buildPeopleRows(admin, students.map((s: any) => s.id as string), students),
      buildPeopleRows(admin, teachers.map((t: any) => t.id as string), teachers),
    ]);
  }

  return (
    <div className="flex flex-col min-h-full overflow-x-hidden">
      <PageHeader
        institution={currentUserUniversity}
        department={currentUserDepartment}
        subtitle="bölüm topluluğun"
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-8 sm:gap-10">

        {hasSchoolAndDepartment && (
          <>
            <section>
              <SectionHeader
                icon={<UserCheck className="w-4 h-4" />} label="Bölüm Öğretmenleri" count={schoolTeachers.length}
                iconBg="bg-blue-50" iconBorder="border-blue-200" iconColor="text-blue-600 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"
                countBg="#DBEAFE" countColor="#2563EB"
              />
              {schoolTeachers.length === 0
                ? <EmptyState icon={<UserCheck className="w-5 h-5 text-slate-300" />} message="Bölümünden kayıtlı öğretmen bulunamadı." />
                : <TeacherGrid teachers={schoolTeachers as TeacherRow[]} />}
            </section>

            <SchoolStudentPanel
              students={schoolStudents as StudentRow[]}
              label="Bölüm Arkadaşları"
              emptyMessage="Henüz kendi üniversite ve bölümünden başka kayıtlı öğrenci yok."
            />
          </>
        )}

        {!hasSchoolAndDepartment && (
          <IncompleteProfileNotice
            hasUniversity={Boolean(currentUserUniversity)}
            hasDepartment={Boolean(currentUserDepartment)}
          />
        )}
      </div>
    </div>
  );
}

// ── Small sub-components ───────────────────────────────────────────────────────

function PageHeader({
  institution,
  department,
  subtitle,
}: {
  institution: string | null;
  department: string | null;
  subtitle: string;
}) {
  return (
    <div
      className="relative overflow-hidden px-4 sm:px-6 lg:px-10 pt-6 pb-8 border-b bg-gradient-to-r from-violet-100 via-purple-50 to-indigo-100 border border-violet-200/90 shadow-sm text-slate-900 dark:from-[#131722] dark:via-[#1b182c] dark:to-[#131722] dark:border-slate-800/80 dark:text-slate-100"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10 bg-white dark:bg-slate-900 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-72 h-32 rounded-full opacity-5 bg-white dark:bg-slate-900 pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-4">
          <BackButton href="/dashboard" variant="light" />
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <School className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Okulum & Bölümüm</p>
        </div>

        {institution && department ? (
          <>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug break-words">
              {institution} <span className="text-violet-600 dark:text-violet-400">•</span> {department}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-600 text-white shadow-sm">
                {institution} • {department}
              </span>
              <span className="text-xs sm:text-sm text-violet-950/70 dark:text-slate-400 font-medium capitalize">
                — {subtitle}
              </span>
            </div>
          </>
        ) : institution ? (
          <>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug break-words">
              {institution}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-semibold">
              Bölüm topluluğunuzu görüntülemek için lütfen bölümünüzü seçin.
            </p>
          </>
        ) : (
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-400 dark:text-slate-500 tracking-tight">
            Henüz okul ve bölüm seçilmedi
          </h1>
        )}
      </div>
    </div>
  );
}

function IncompleteProfileNotice({
  hasUniversity,
  hasDepartment,
}: {
  hasUniversity: boolean;
  hasDepartment: boolean;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 min-h-[220px] flex flex-col items-center justify-center gap-3 p-6 sm:p-8 text-center shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
        <School className="w-6 h-6" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
        {!hasUniversity && !hasDepartment
          ? 'Okul ve Bölüm Bilginizi Tamamlayın'
          : !hasUniversity
          ? 'Üniversite / Okul Bilginizi Seçin'
          : 'Bölüm Bilginizi Seçin'}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
        Okulum sayfasında yalnızca kendi üniversite ve bölümünüzdeki öğrenci arkadaşlarınızı ve danışman öğretmenlerinizi görebilirsiniz. Devam etmek için profil düzenleme sayfasından okul ve bölüm bilginizi kaydedin.
      </p>
      <Link
        href="/dashboard/settings"
        className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-violet-500/20 transition-all"
      >
        Profili Tamamla (Ayarlara Git) →
      </Link>
    </div>
  );
}

export default function SchoolPage() {
  return (
    <Suspense fallback={<SchoolLoading />}>
      <SchoolPageContent />
    </Suspense>
  );
}
