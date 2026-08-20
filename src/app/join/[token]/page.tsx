import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AutoJoinHandler from './AutoJoinHandler';

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/join/${token}`);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17] flex items-center justify-center p-6">
      <AutoJoinHandler token={token} />
    </div>
  );
}