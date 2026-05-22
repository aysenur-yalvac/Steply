import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';
import { School, UserCheck, ExternalLink, Phone, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import SchoolStudentPanel, { type StudentRow } from '@/components/school/SchoolStudentPanel';

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

// ── Shared UI helpers ──────────────────────────────────────────────────────────

function PhotoPlaceholder({ name, colorIndex }: { name: string | null; colorIndex: number }) {
  const palettes = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
  ];
  const initials = (name ?? '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className={`w-full h-full bg-gradient-to-br ${palettes[colorIndex % palettes.length]} flex items-center justify-center`}>
      <span className="text-white font-extrabold text-xl select-none">{initials}</span>
    </div>
  );
}

function CardPhoto({ avatarUrl, name, colorIndex }: { avatarUrl: string | null; name: string | null; colorIndex: number }) {
  const isReal = avatarUrl && !avatarUrl.includes('dicebear') && !avatarUrl.includes('api.');
  return (
    <div className="w-32 shrink-0 overflow-hidden rounded-l-2xl">
      {isReal ? (
        <img
          src={avatarUrl!}
          alt={name ?? ''}
          className="w-full h-full object-cover object-center"
          style={{ imageRendering: 'auto', WebkitFontSmoothing: 'antialiased' } as React.CSSProperties}
        />
      ) : (
        <PhotoPlaceholder name={name} colorIndex={colorIndex} />
      )}
    </div>
  );
}

/* Teacher card — no school_number / school_email */
function TeacherCard({ person, colorIndex = 0 }: { person: PersonRow; colorIndex?: number }) {
  return (
    <Link
      href={`/user/${person.id}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-36 flex flex-row overflow-hidden"
    >
      <CardPhoto avatarUrl={person.avatar_url} name={person.full_name} colorIndex={colorIndex} />

      <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-base font-bold text-slate-900 leading-tight truncate group-hover:text-blue-700 transition-colors">
              {person.full_name ?? 'Steply Üyesi'}
            </p>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
          </div>
          <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            Öğretmen
          </span>
        </div>

        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={`text-sm font-medium truncate ${person.phone_number ? 'text-slate-700' : 'text-slate-400 italic'}`}>
              {person.phone_number ?? 'Telefon belirtilmemiş'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{person.projectCount} proje</span>
        </div>
      </div>
    </Link>
  );
}

function PeopleGrid({ people, accentColor }: { people: PersonRow[]; accentColor?: 'violet' | 'blue' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {people.map((p, i) => <TeacherCard key={p.id} person={p} colorIndex={i} />)}
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

  const role        = profile?.role ?? 'student';
  const institution = profile?.institution ?? null;
  const admin       = createAdminClient();

  // ── TEACHER VIEW ─────────────────────────────────────────────────────────────
  if (role === 'teacher') {
    // Watched student IDs (via mentored_projects)
    const { data: mentored } = await admin
      .from('mentored_projects')
      .select('project_id')
      .eq('teacher_id', user.id);

    let watchedStudentIds: string[] = [];
    if ((mentored ?? []).length > 0) {
      const projectIds = (mentored ?? []).map((r: any) => r.project_id as string);
      const { data: watchedProjects } = await admin
        .from('projects').select('student_id').in('id', projectIds);
      watchedStudentIds = [...new Set((watchedProjects ?? []).map((r: any) => r.student_id as string))];
    }

    // Students at the same institution
    let schoolStudents: PersonRow[] = [];
    if (institution) {
      const { data: sameSchool } = await admin
        .from('profiles')
        .select('id, full_name, avatar_url, institution, role, grade, school_number, school_email, phone_number')
        .ilike('institution', institution.trim())
        .eq('role', 'student')
        .neq('id', user.id);
      const ids = (sameSchool ?? []).map((s: any) => s.id as string);
      schoolStudents = await buildPeopleRows(admin, ids, sameSchool ?? []);
    }

    // Watched students NOT at this institution (cross-school)
    const watchedNotInSchool = watchedStudentIds.filter(
      (id) => !schoolStudents.some((s) => s.id === id),
    );
    let extraWatched: PersonRow[] = [];
    if (watchedNotInSchool.length > 0) {
      const { data: extra } = await admin
        .from('profiles').select('id, full_name, avatar_url, institution, role, grade, school_number, school_email, phone_number').in('id', watchedNotInSchool);
      extraWatched = await buildPeopleRows(admin, watchedNotInSchool, extra ?? []);
    }

    const watchedStudents = schoolStudents.filter((s) => watchedStudentIds.includes(s.id));
    const otherStudents   = schoolStudents.filter((s) => !watchedStudentIds.includes(s.id));
    const allWatched      = [...watchedStudents, ...extraWatched];

    return (
      <div className="flex flex-col min-h-full">
        <PageHeader institution={institution} subtitle="öğrenciler" />
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-10">
          {/* Watched */}
          <section>
            <SectionHeader
              icon={<UserCheck className="w-4 h-4" />} label="Takip Ettiklerim" count={allWatched.length}
              iconBg="bg-violet-50" iconBorder="border-violet-200" iconColor="text-violet-600"
              countBg="#EDE9FE" countColor="#7C3AED"
            />
            {allWatched.length === 0
              ? <EmptyState icon={<UserCheck className="w-6 h-6 text-slate-300" />} message="Henüz takip ettiğin öğrenci yok." sub="Öğrenci profillerindeki Bookmark butonuyla projeleri takibe alabilirsin." />
              : <PeopleGrid people={allWatched} accentColor="violet" />}
          </section>

          {/* School students grouped by grade */}
          {institution && (
            <SchoolStudentPanel students={otherStudents as StudentRow[]} />
          )}

          {!institution && <NoInstitutionNotice />}
        </div>
      </div>
    );
  }

  // ── STUDENT VIEW ─────────────────────────────────────────────────────────────
  let schoolStudents: PersonRow[] = [];
  let schoolTeachers: PersonRow[] = [];

  if (institution) {
    const { data: peers, error: peersError } = await admin
      .from('profiles')
      .select('id, full_name, avatar_url, institution, role, grade, school_number, school_email, phone_number')
      .ilike('institution', institution.trim())
      .neq('id', user.id);
    console.log('DB Sonucu:', peers, 'Hata:', peersError, 'institution:', institution);

    const students = (peers ?? []).filter((p: any) => p.role === 'student' || !p.role);
    const teachers = (peers ?? []).filter((p: any) => p.role === 'teacher');

    const [studentIds, teacherIds] = [
      students.map((s: any) => s.id as string),
      teachers.map((t: any) => t.id as string),
    ];

    [schoolStudents, schoolTeachers] = await Promise.all([
      buildPeopleRows(admin, studentIds, students),
      buildPeopleRows(admin, teacherIds, teachers),
    ]);
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader institution={institution} subtitle="okul topluluğun" />
      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-10">

        {/* Teachers section — at the top */}
        {institution && (
          <section>
            <SectionHeader
              icon={<UserCheck className="w-4 h-4" />} label="Öğretmenler" count={schoolTeachers.length}
              iconBg="bg-blue-50" iconBorder="border-blue-200" iconColor="text-blue-600"
              countBg="#DBEAFE" countColor="#2563EB"
            />
            {schoolTeachers.length === 0
              ? <EmptyState icon={<UserCheck className="w-6 h-6 text-slate-300" />} message="Okulundan kayıtlı öğretmen bulunamadı." />
              : <PeopleGrid people={schoolTeachers} accentColor="blue" />}
          </section>
        )}

        {/* Students grouped by grade with filter */}
        <SchoolStudentPanel students={schoolStudents as StudentRow[]} />

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
          <h1 className="text-3xl font-extrabold text-white/60 tracking-tight">Okul bilgisi ayarlanmamış</h1>
        )}
      </div>
    </div>
  );
}

function NoInstitutionNotice() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 min-h-[200px] flex flex-col items-center justify-center gap-3 p-8">
      <School className="w-8 h-8 text-slate-300" />
      <p className="text-sm text-slate-500 font-medium">Okul bilgisi bulunamadı.</p>
      <p className="text-xs text-slate-400 text-center max-w-xs">
        Profil ayarlarından okul/kurum bilgini ekleyerek aynı okuldaki herkesi görebilirsin.
      </p>
      <Link href="/dashboard/settings" className="text-xs font-semibold text-violet-600 hover:underline mt-1">
        Ayarlara git →
      </Link>
    </div>
  );
}
