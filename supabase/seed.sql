DO $$
DECLARE
    i INTEGER;
    temp_user_id UUID;
    temp_project_id UUID;
    student_ids UUID[] := '{}';
    teacher_ids UUID[] := '{}';
    project_ids UUID[] := '{}';
BEGIN
    -- 1. Öğretmenleri Oluştur (20 Adet)
    FOR i IN 1..20 LOOP
        temp_user_id := gen_random_uuid();
        INSERT INTO profiles (id, full_name, role)
        VALUES (temp_user_id, 'Öğretmen ' || i, 'teacher');
        teacher_ids := array_append(teacher_ids, temp_user_id);
    END LOOP;

    -- 2. Öğrencileri Oluştur (100 Adet)
    FOR i IN 1..100 LOOP
        temp_user_id := gen_random_uuid();
        INSERT INTO profiles (id, full_name, role)
        VALUES (temp_user_id, 'Öğrenci ' || i, 'student');
        student_ids := array_append(student_ids, temp_user_id);
    END LOOP;

    -- 3. Projeleri Oluştur (50 Adet, rastgele öğrencilere dağıt)
    FOR i IN 1..50 LOOP
        temp_user_id := student_ids[floor(random() * 100 + 1)];
        temp_project_id := gen_random_uuid();
        
        INSERT INTO projects (id, title, description, progress_percentage, student_id, files, team_members)
        VALUES (
            temp_project_id,
            'Yapay Zeka Projesi ' || i,
            'Bu proje, eğitim teknolojileri alanında yeni nesil çözümler sunmayı hedefler.',
            floor(random() * 101),
            temp_user_id,
            '[]'::jsonb,
            '[]'::jsonb
        );
        project_ids := array_append(project_ids, temp_project_id);
    END LOOP;

    -- 4. Sosyal Etkileşimler (Rastgele)
    -- Takipçiler
    FOR i IN 1..200 LOOP
        INSERT INTO followers (follower_id, following_id)
        VALUES (
            student_ids[floor(random() * 100 + 1)],
            student_ids[floor(random() * 100 + 1)]
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Yorumlar
    FOR i IN 1..150 LOOP
        INSERT INTO comments (project_id, user_id, content)
        VALUES (
            project_ids[floor(random() * 50 + 1)],
            student_ids[floor(random() * 100 + 1)],
            'Harika bir çalışma olmuş, tebrikler!'
        );
    END LOOP;

    -- Oylama
    FOR i IN 1..300 LOOP
        INSERT INTO ratings (project_id, user_id, score)
        VALUES (
            project_ids[floor(random() * 50 + 1)],
            student_ids[floor(random() * 100 + 1)],
            floor(random() * 5 + 1)
        ) ON CONFLICT DO NOTHING;
    END LOOP;

END $$;
