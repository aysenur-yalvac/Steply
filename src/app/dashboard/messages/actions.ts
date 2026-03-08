'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Oturum açmanız gerekiyor.' };
  }

  const receiverId = formData.get('receiver_id') as string;
  const content = formData.get('content') as string;
  const currentPath = formData.get('current_path') as string;

  if (!receiverId || !content.trim()) {
    return { error: 'Alıcı ve mesaj içeriği boş olamaz.' };
  }

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content.trim(),
    is_read: false
  });

  if (error) {
    console.error('Mesaj gönderme hatası:', error);
    return { error: 'Mesaj gönderilemedi.' };
  }

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
     console.error('Mesajları okundu isaretleme hatası:', error);
  }
}
