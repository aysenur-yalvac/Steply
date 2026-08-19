'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RealtimeNotifications({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
        (payload) => {
          const newMsg = payload.new as any;
          toast('Yeni bir mesajınız var!', {
            icon: '💬',
            style: {
              background: '#0f172a',
              color: '#f1f5f9',
              border: '1px solid #1e293b'
            }
          });
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'project_tasks', filter: `assignee_id=eq.${userId}` },
        (payload) => {
          const newTask = payload.new as any;
          toast('Size yeni bir görev atandı!', {
            icon: '📋',
            style: {
              background: '#0f172a',
              color: '#f1f5f9',
              border: '1px solid #1e293b'
            }
          });
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'project_notes' },
        (payload) => {
          // It's harder to filter notes by user's projects using RLS in realtime directly without a view.
          // We'll just notify if we receive it (RLS should filter it if realtime respects it)
          toast('Projenize yeni bir not eklendi!', {
            icon: '📝',
            style: {
              background: '#0f172a',
              color: '#f1f5f9',
              border: '1px solid #1e293b'
            }
          });
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
