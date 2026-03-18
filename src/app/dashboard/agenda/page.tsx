import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AgendaClient from '@/app/dashboard/agenda/AgendaClient';


export default async function AgendaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'teacher') {
    return (
       <div className="p-10 text-center">
         <h1 className="text-2xl font-bold text-slate-800">Teachers don't have personal agendas here.</h1>
       </div>
    );
  }

  // Fetch student's agenda tasks with fallback for user_id vs student_id
  let { data: tasks, error: agendaError } = await supabase
    .from('agenda_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  if (agendaError && agendaError.code === '42703') {
     const retryFetch = await supabase
       .from('agenda_tasks')
       .select('*')
       .eq('student_id', user.id)
       .order('due_date', { ascending: true });
     tasks = retryFetch.data;
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AgendaClient initialTasks={tasks || []} />
    </div>
  );
}
