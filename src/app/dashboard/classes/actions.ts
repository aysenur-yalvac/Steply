'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createClassAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  
  // Generate code e.g. STP-XXXX
  const generateCode = () => 'STP-' + Math.floor(1000 + Math.random() * 9000).toString();
  
  let code = generateCode();
  
  const { data, error } = await supabase.from('classes').insert({
    teacher_id: user.id,
    name,
    description,
    code
  }).select().single();
  
  if (error) {
    if (error.code === '23505') { // UNIQUE violation for code
      // Try once more with a new code
      code = generateCode();
      const { data: retryData, error: retryError } = await supabase.from('classes').insert({
        teacher_id: user.id,
        name,
        description,
        code
      }).select().single();
      if (retryError) throw new Error(retryError.message);
      revalidatePath('/dashboard/classes');
      return retryData;
    }
    throw new Error(error.message);
  }
  
  revalidatePath('/dashboard/classes');
  return data;
}

export async function joinClassAction(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  // Find class by code
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('id')
    .eq('code', code)
    .single();
    
  if (classError || !classData) {
    throw new Error("Geçersiz katılım kodu.");
  }
  
  // Insert into class_members
  const { error: joinError } = await supabase
    .from('class_members')
    .insert({
      class_id: classData.id,
      student_id: user.id
    });
    
  if (joinError) {
    if (joinError.code === '23505') {
      throw new Error("Bu sınıfa zaten kayıtlısınız.");
    }
    throw new Error(joinError.message);
  }
  
  revalidatePath('/dashboard/classes');
  return { success: true };
}
