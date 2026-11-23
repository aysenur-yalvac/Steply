import { createClient } from '@/utils/supabase/server';
import { getCachedUser } from '@/lib/auth-cache';
import { redirect } from 'next/navigation';
import AgendaClient from '@/app/dashboard/agenda/AgendaClient';
import { BackButton } from '@/components/ui/back-button';

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const user = await getCachedUser();
  if (!user) redirect('/auth/login');

  const supabase = await createClient();
  const { data: rawTasks, error } = await supabase
    .from('agenda_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('[AgendaPage] agenda_tasks fetch error:', error);
  }

  const tasks = (rawTasks || []).map((t: any) => ({
    id: t.id,
    title: t.title || t.task_title || '',
    due_date: t.due_date,
    is_completed: t.is_completed ?? false,
  }));

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-10 lg:p-12">
      <div className="mb-6">
        <BackButton href="/dashboard" variant="light" />
      </div>
      <AgendaClient initialTasks={tasks} />
    </div>
  );
}
