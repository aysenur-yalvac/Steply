import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getProjectInvitePreviewAction } from '@/lib/actions';
import AutoJoinHandler from './AutoJoinHandler';

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/join/${token}`);
  }

  const previewResult = await getProjectInvitePreviewAction(token);

  // Eğer kullanıcı zaten bu projenin sahibiyse veya aktif üyesiyse onay sormadan doğrudan projeye yönlendir
  if (previewResult.success && (previewResult.preview.isOwner || previewResult.preview.alreadyMember)) {
    redirect(`/dashboard/projects/${previewResult.preview.projectId}`);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17] flex items-center justify-center p-6">
      <AutoJoinHandler
        token={token}
        initialPreview={previewResult.success ? previewResult.preview : null}
        initialError={!previewResult.success ? previewResult.error : null}
      />
    </div>
  );
}