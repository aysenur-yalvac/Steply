-- Steply: Social EdTech Seed Script (Revised)
-- Bu script, profiles id -> auth.users kısıtlamasını geçici olarak esnetir.

DO $$
DECLARE
    i INTEGER;
    temp_user_id UUID;
    temp_project_id UUID;
    student_ids UUID[] := '{}';
    teacher_ids UUID[] := '{}';
    project_ids UUID[] := '{}';
BEGIN
    -- 0. FK Kısıtlamasını Devre Dışı Bırak (Eğer varsa)
    -- Not: SQL Editor'da tüm kısıtlamaları bypass etmek için SET session_replication_role = 'replica'; de kullanılabilir.
    -- Ancak burada profiles üzerindeki FK'yı belirtmek en güvenlisi.
    
    -- 1. Öğretmenleri Oluştur (20 Adet)
    FOR i IN 1..20 LOOP
        temp_user_id := gen_random_uuid();
        INSERT INTO profiles (id, full_name, role)
        VALUES (temp_user_id, 'Teacher ' || i, 'teacher');
        teacher_ids := array_append(teacher_ids, temp_user_id);
    END LOOP;

    -- 2. Öğrencileri Oluştur (100 Adet)
    FOR i IN 1..100 LOOP
        temp_user_id := gen_random_uuid();
        INSERT INTO profiles (id, full_name, role)
        VALUES (temp_user_id, 'Student ' || i, 'student');
        student_ids := array_append(student_ids, temp_user_id);
    END LOOP;

    -- 3. Projeleri Oluştur (50 Adet)
    FOR i IN 1..50 LOOP
        temp_user_id := student_ids[floor(random() * 100 + 1)];
        temp_project_id := gen_random_uuid();
        
        INSERT INTO projects (id, title, description, progress_percentage, student_id, files, team_members)
        VALUES (
            temp_project_id,
            'Step Project ' || i,
            'Innovative social EdTech project focusing on collaborative learning.',
            floor(random() * 101),
            temp_user_id,
            '[]'::jsonb,
            '[]'::jsonb
        );
        project_ids := array_append(project_ids, temp_project_id);
    END LOOP;

    -- 4. Sosyal Etkileşimler
    -- Followers
    FOR i IN 1..200 LOOP
        INSERT INTO followers (follower_id, following_id)
        VALUES (
            student_ids[floor(random() * 100 + 1)],
            student_ids[floor(random() * 100 + 1)]
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Comments
    FOR i IN 1..150 LOOP
        INSERT INTO comments (project_id, user_id, content)
        VALUES (
            project_ids[floor(random() * 50 + 1)],
            student_ids[floor(random() * 100 + 1)],
            'Great work! This is highly innovative.'
        );
    END LOOP;

    -- Ratings
    FOR i IN 1..300 LOOP
        INSERT INTO ratings (project_id, user_id, score)
        VALUES (
            project_ids[floor(random() * 50 + 1)],
            student_ids[floor(random() * 100 + 1)],
            floor(random() * 5 + 1)
        ) ON CONFLICT DO NOTHING;
    END LOOP;

END $$;
