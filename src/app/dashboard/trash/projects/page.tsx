import { createClient } from '@/utils/supabase/server';
import TrashProjectsClient from './TrashProjectsClient';

export default async function TrashProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('*, profiles!student_id(full_name, avatar_url, is_public)')
    .not('deleted_at', 'is', null)
    .eq('student_id', user?.id)
    .order('deleted_at', { ascending: false });

  const items = projects || [];

  return (
    <div className="space-y-6">
      <TrashProjectsClient initialProjects={items} currentUserId={user?.id || ""} />
    </div>
  );
}
