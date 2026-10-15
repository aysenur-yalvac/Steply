'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createClassAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return {
        success: false,
        error: "Oturum süreniz dolmuş veya kullanıcı doğrulanamadı. Lütfen tekrar giriş yapın."
      };
    }

    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || null;

    if (!name) {
      return {
        success: false,
        error: "Sınıf adı zorunludur."
      };
    }

    const admin = createAdminClient();

    // Sınıf kodu üretici (STP-XXXX formatında benzersiz)
    const generateCode = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let c = "STP-";
      for (let i = 0; i < 4; i++) {
        c += chars[Math.floor(Math.random() * chars.length)];
      }
      return c;
    };

    let code = generateCode();
    let isUnique = false;

    for (let attempts = 0; attempts < 10; attempts++) {
      const { data: existing } = await admin
        .from('classes')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
        break;
      }
      code = generateCode();
    }

    const { data, error } = await admin
      .from('classes')
      .insert({
        teacher_id: user.id,
        name,
        description,
        code
      })
      .select()
      .single();

    if (error) {
      console.error("createClassAction Supabase Error:", error);
      return {
        success: false,
        error: error.message || "Sınıf oluşturulurken veritabanı hatası oluştu."
      };
    }

    revalidatePath('/dashboard/classes');
    return {
      success: true,
      data
    };
  } catch (err: any) {
    console.error("createClassAction Unexpected Error:", err);
    return {
      success: false,
      error: err?.message || "Sınıf oluşturulurken beklenmeyen bir hata meydana geldi."
    };
  }
}

export async function joinClassAction(code: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return {
        success: false,
        error: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın."
      };
    }

    const cleanCode = code?.trim().toUpperCase();
    if (!cleanCode) {
      return {
        success: false,
        error: "Lütfen geçerli bir katılım kodu girin."
      };
    }

    const admin = createAdminClient();

    // Sınıfı koda göre bul
    const { data: classData, error: classError } = await admin
      .from('classes')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (classError || !classData) {
      return {
        success: false,
        error: "Geçersiz veya bulunamayan katılım kodu."
      };
    }

    // Sınıf üyelerine ekle
    const { data: memberData, error: joinError } = await admin
      .from('class_members')
      .insert({
        class_id: classData.id,
        student_id: user.id
      })
      .select()
      .single();

    if (joinError) {
      if (joinError.code === '23505') {
        return {
          success: false,
          error: "Bu sınıfa zaten kayıtlısınız."
        };
      }
      return {
        success: false,
        error: joinError.message || "Sınıfa kayıt olurken bir hata oluştu."
      };
    }

    // Öğretmen profilini getir
    const { data: teacherProfile } = await admin
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('id', classData.teacher_id)
      .maybeSingle();

    const fullClass = {
      ...classData,
      profiles: teacherProfile || { full_name: 'Öğretmen' }
    };

    // Revalidation çağrıları
    revalidatePath('/dashboard/classes');
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/classes/${classData.id}`);

    return {
      success: true,
      data: {
        class_id: classData.id,
        joined_at: memberData?.joined_at || new Date().toISOString(),
        classes: fullClass
      }
    };
  } catch (err: any) {
    console.error("joinClassAction Unexpected Error:", err);
    return {
      success: false,
      error: err?.message || "Sınıfa katılırken beklenmeyen bir hata meydana geldi."
    };
  }
}
