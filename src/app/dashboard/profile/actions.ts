'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Oturum açmanız gerekiyor.' };
  }

  const userId = formData.get('id') as string;
  const fullName = formData.get('full_name') as string;

  if (userId !== user.id) {
     return { error: 'Yetkisiz işlem.' };
  }

  if (!fullName || fullName.trim().length < 2) {
    return { error: 'Lütfen geçerli bir ad soyad giriniz.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', user.id);

  if (error) {
    console.error('Profil güncelleme hatası:', error);
    return { error: 'Profil güncellenirken bir hata oluştu.' };
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}
