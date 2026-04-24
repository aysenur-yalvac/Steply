'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotificationAction } from '@/lib/actions';

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in.' };
  }

  const receiverId = formData.get('receiver_id') as string;
  const content = formData.get('content') as string;
  const currentPath = formData.get('current_path') as string;

  if (!receiverId || !content.trim()) {
    return { error: 'Receiver and message content cannot be empty.' };
  }

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content.trim(),
    is_read: false
  });

  if (error) {
    console.error('Profile update error:', error);
    return { error: 'An error occurred while updating the profile.' };
  }

  // Fetch sender name for notification
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();
  const senderName = senderProfile?.full_name || 'Someone';

  await createNotificationAction(
    receiverId,
    'message',
    `New message from ${senderName}`,
    content.trim().slice(0, 120),
    user.id,
  );

  revalidatePath(currentPath || '/dashboard/messages');
  return { success: true };
}

export async function markMessagesAsRead(senderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .match({ sender_id: senderId, receiver_id: user.id, is_read: false });
    
  if (error) {
     console.error('Error marking messages as read:', error);
  }
}
