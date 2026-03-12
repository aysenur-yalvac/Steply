'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in.' };
  }

  const userId = formData.get('id') as string;
  const fullName = formData.get('full_name') as string;

  if (userId !== user.id) {
     return { error: 'Unauthorized action.' };
  }

  if (!fullName || fullName.trim().length < 2) {
    return { error: 'Please enter a valid full name.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', user.id);

  if (error) {
    console.error('Profile update error:', error);
    return { error: 'An error occurred while updating the profile.' };
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}
