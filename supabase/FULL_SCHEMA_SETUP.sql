-- =============================================================
-- STEPLY — TAM VERİTABANI KURULUM SCRIPTİ
-- Supabase SQL Editor'a kopyalayıp doğrudan çalıştırabilirsiniz.
-- Oluşturulma: 2026-07-11 | Kaynak: tüm migration dosyaları
--
-- ÇALIŞTIRMA SIRASI (bağımlılık sırasına göre):
--   1. Uzantılar
--   2. Core tablolar (profiles, projects, messages)
--   3. Sosyal tablolar (follows, blocks, comments, ratings)
--   4. Proje yönetim tabloları
--   5. Analitik tablolar
--   6. Sistem tabloları
--   7. Storage bucket
--   8. PostgreSQL fonksiyonları
--   9. Trigger'lar
--  10. RLS politikaları
--  11. İndeksler
-- =============================================================


-- =============================================================
-- BÖLÜM 1: UZANTILAR (Extensions)
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;


-- =============================================================
-- BÖLÜM 2: CORE TABLOLAR
-- =============================================================

-- ── profiles ──────────────────────────────────────────────────
-- Tüm kullanıcıların (öğrenci + öğretmen) ana profil tablosu.
-- auth.users'a CASCADE bağlı — kullanıcı silinince profil de silinir.
-- handle_new_user() trigger'ı ile auth kayıt anında otomatik oluşturulur.
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT,
    role            TEXT        CHECK (role IN ('student', 'teacher')),
    email           TEXT        UNIQUE,
    steply_score    INTEGER     DEFAULT 0,       -- eski trigger-tabanlı skor
    total_score     INTEGER     DEFAULT 0,       -- yeni ağırlıklı leaderboard puanı
    badges          TEXT[]      DEFAULT '{}',    -- kazanılan rozet ID'leri
    university      TEXT,                        -- leaderboard filtreleme
    institution     TEXT,                        -- okul/kurum adı
    is_public       BOOLEAN     NOT NULL DEFAULT true,
    avatar_url      TEXT,
    bio             TEXT,
    phone_number    TEXT,
    github_url      TEXT,
    linkedin_url    TEXT,
    twitter_url     TEXT,
    instagram_url   TEXT,
    website_url     TEXT,
    company         TEXT,                        -- Settings: iş yeri / kurum
    country         TEXT,                        -- Settings: ülke
    location        TEXT,                        -- Settings: şehir/il
    grade           TEXT,                        -- Settings: öğrenci sınıfı
    school_number   TEXT,                        -- Settings: okul numarası
    school_email    TEXT,                        -- Settings: okul e-postası
    created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Bu 6 sütun tabloya sonradan eklendi (20260721_profile_extra_fields.sql).
-- Tablo zaten mevcutsa yukarıdaki CREATE TABLE no-op olur — ALTER TABLE ile garantiye alınıyor.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_email TEXT;

-- ── projects ──────────────────────────────────────────────────
-- Öğrencilerin proje kayıtları.
-- student_id → profiles(id): proje sahibi öğrenci.
CREATE TABLE IF NOT EXISTS public.projects (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title               TEXT        NOT NULL,
    description         TEXT,
    progress_percentage INTEGER     DEFAULT 0,
    is_private          BOOLEAN     NOT NULL DEFAULT false,
    tags                TEXT[]      DEFAULT '{}',
    files               JSONB       DEFAULT '[]',
    team_members        JSONB       DEFAULT '[]',   -- legacy; asıl üyelik project_members tablosunda
    created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ── messages ──────────────────────────────────────────────────
-- Kullanıcılar arası doğrudan mesajlaşma.
-- sender_id + receiver_id → profiles(id).
CREATE TABLE IF NOT EXISTS public.messages (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content     TEXT        NOT NULL,
    is_read     BOOLEAN     DEFAULT false,
    metadata    JSONB       DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);


-- =============================================================
-- BÖLÜM 3: SOSYAL TABLOLAR
-- =============================================================

-- ── follows ───────────────────────────────────────────────────
-- Yeni Instagram-tarzı takip sistemi.
-- Composite PK: (follower_id, following_id) — tekrar eden takip yok.
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- ── followers ─────────────────────────────────────────────────
-- Eski takip tablosu (UUID PK'li, hâlâ aktif — steply_score trigger'ı bu tabloyu kullanır).
-- NOT: follows tablosu ile paralel çalışmaktadır.
CREATE TABLE IF NOT EXISTS public.followers (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id    UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (follower_id, following_id)
);

-- ── blocks ────────────────────────────────────────────────────
-- Kullanıcı engelleme sistemi.
-- Composite PK: (blocker_id, blocked_id).
CREATE TABLE IF NOT EXISTS public.blocks (
    blocker_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- ── comments ──────────────────────────────────────────────────
-- Projelere yapılan yorumlar.
-- project_id → projects(id), user_id → profiles(id).
CREATE TABLE IF NOT EXISTS public.comments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID        REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ── ratings ───────────────────────────────────────────────────
-- Proje puanlama sistemi (1-5 arası).
-- UNIQUE (project_id, user_id): bir kullanıcı bir projeye bir kez puan verebilir.
CREATE TABLE IF NOT EXISTS public.ratings (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID        REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    score       INTEGER     CHECK (score >= 1 AND score <= 5),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (project_id, user_id)
);


-- =============================================================
-- BÖLÜM 4: PROJE YÖNETİM TABLOLARI
-- =============================================================

-- ── project_members ───────────────────────────────────────────
-- Projenin ekip üyelerini tutan ilişki tablosu.
-- project_id → projects(id), user_id → profiles(id).
-- UNIQUE (project_id, user_id): aynı kişi aynı projeye iki kez eklenemez.
CREATE TABLE IF NOT EXISTS public.project_members (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role        TEXT        NOT NULL DEFAULT 'member',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, user_id)
);

-- ── project_tasks ─────────────────────────────────────────────
-- Proje görev listesi (to-do / milestone).
-- project_id → projects(id).
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title       TEXT        NOT NULL,
    is_completed BOOLEAN    DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ── project_activities ────────────────────────────────────────
-- Proje aktivite akışı (kim ne yaptı log'u).
-- user_id burada FK yok — silinen kullanıcılar için log tutulabilsin diye.
CREATE TABLE IF NOT EXISTS public.project_activities (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL,
    action_type TEXT        NOT NULL,
    description TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ── project_discussions ───────────────────────────────────────
-- Ekip içi tartışma / yorum sistemi (owner + collaborator only).
-- project_notes tablosundan farklı: bu ekip içi, öteki öğretmen notları.
CREATE TABLE IF NOT EXISTS public.project_discussions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL,
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ── project_favorites ─────────────────────────────────────────
-- Proje beğeni/favori sistemi.
-- Composite PK: (user_id, project_id).
CREATE TABLE IF NOT EXISTS public.project_favorites (
    user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, project_id)
);

-- ── project_types ─────────────────────────────────────────────
-- Proje tipi öneri tablosu (akıllı autocomplete için).
-- Yazma işlemi yalnızca service-role admin client üzerinden yapılır.
CREATE TABLE IF NOT EXISTS public.project_types (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT        NOT NULL,
    usage_count INTEGER     NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT project_types_name_unique UNIQUE (name)
);

-- ── mentored_projects ─────────────────────────────────────────
-- Öğretmenlerin izleme listesi (watchlist).
-- teacher_id → profiles(id), project_id → projects(id).
CREATE TABLE IF NOT EXISTS public.mentored_projects (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id  UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id  UUID        REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (teacher_id, project_id)
);

-- ── project_notes ─────────────────────────────────────────────
-- Öğretmen hızlı notları (sadece öğretmenler yazar).
-- teacher_id → profiles(id), project_id → projects(id).
CREATE TABLE IF NOT EXISTS public.project_notes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id  UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id  UUID        REFERENCES public.projects(id) ON DELETE CASCADE,
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);


-- =============================================================
-- BÖLÜM 5: ANALİTİK TABLOLAR
-- =============================================================

-- ── user_activities ───────────────────────────────────────────
-- Günlük aktivite heatmap + ağırlıklı puan takibi.
-- UNIQUE (user_id, date): günlük tek satır, activity_count/daily_score artırılır.
-- auth.users'a bağlı (profiles değil) — daha sağlam FK.
CREATE TABLE IF NOT EXISTS public.user_activities (
    id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date            DATE        NOT NULL DEFAULT CURRENT_DATE,
    activity_count  INTEGER     NOT NULL DEFAULT 1,
    daily_score     INTEGER     DEFAULT 0,
    UNIQUE (user_id, date)
);

-- ── agenda_tasks ──────────────────────────────────────────────
-- Kullanıcının kişisel takvim görevleri.
-- user_id → profiles(id).
CREATE TABLE IF NOT EXISTS public.agenda_tasks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
    title       TEXT        NOT NULL,
    due_date    DATE        NOT NULL,
    is_completed BOOLEAN    DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ── notifications ─────────────────────────────────────────────
-- Kullanıcı bildirimleri.
-- user_id → profiles(id). INSERT yalnızca service-role (sunucu tarafı) ile yapılır.
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        TEXT        NOT NULL CHECK (type IN ('message', 'project', 'task')),
    title       TEXT        NOT NULL,
    body        TEXT,
    is_read     BOOLEAN     DEFAULT false,
    related_id  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);


-- =============================================================
-- BÖLÜM 6: SİSTEM TABLOLARI
-- =============================================================

-- ── linked_accounts ───────────────────────────────────────────
-- Çoklu hesap hızlı geçiş sistemi.
-- UNIQUE (owner_user_id, linked_email): aynı email iki kez eklenemez.
CREATE TABLE IF NOT EXISTS public.linked_accounts (
    id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    linked_user_id  UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    linked_email    TEXT        NOT NULL,
    linked_name     TEXT,
    linked_avatar   TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (owner_user_id, linked_email)
);

-- ── universities ──────────────────────────────────────────────
-- 10.000+ üniversite kaydı (search_universities() RPC ile aranır).
-- NOT: Seed verisini (10 214 satır) ayrı dosyadan çalıştırın:
--   supabase/migrations/20260518_universities.sql
CREATE TABLE IF NOT EXISTS public.universities (
    id      SERIAL      PRIMARY KEY,
    name    TEXT        NOT NULL,
    country TEXT        NOT NULL
);

-- Unique constraint for upsert safety (add_ksbu migration'dan)
CREATE UNIQUE INDEX IF NOT EXISTS universities_name_country_lower_idx
    ON public.universities (lower(name), lower(country));


-- =============================================================
-- BÖLÜM 7: STORAGE BUCKET (project-files)
-- =============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-files',
    'project-files',
    true,
    104857600,  -- 100 MB
    NULL
)
ON CONFLICT (id) DO UPDATE SET
    public              = EXCLUDED.public,
    file_size_limit     = EXCLUDED.file_size_limit,
    allowed_mime_types  = EXCLUDED.allowed_mime_types;


-- =============================================================
-- BÖLÜM 8: POSTGRESQL FONKSİYONLARI
-- =============================================================

-- ── handle_new_user ───────────────────────────────────────────
-- Auth trigger fonksiyonu: yeni kullanıcı kaydında profiles satırı oluşturur.
-- raw_user_meta_data'dan full_name ve role alınır; role yoksa 'student' atanır.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        COALESCE(new.raw_user_meta_data->>'role', 'student')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── calculate_steply_score ────────────────────────────────────
-- Eski skor sistemi: (takipçi×10) + (avg_rating×20) + (yorum sayısı×5)
-- followers tablosunu kullanır. update_score_on_* trigger'ları tarafından çağrılır.
CREATE OR REPLACE FUNCTION public.calculate_steply_score(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    f_count     INTEGER;
    avg_rating  FLOAT;
    c_count     INTEGER;
    total_score INTEGER;
BEGIN
    SELECT count(*) INTO f_count
    FROM public.followers WHERE following_id = user_uuid;

    SELECT COALESCE(avg(r.score), 0) INTO avg_rating
    FROM public.ratings r
    JOIN public.projects p ON r.project_id = p.id
    WHERE p.student_id = user_uuid;

    SELECT count(*) INTO c_count
    FROM public.comments c
    JOIN public.projects p ON c.project_id = p.id
    WHERE p.student_id = user_uuid;

    total_score := (f_count * 10) + (avg_rating * 20) + (c_count * 5);

    UPDATE public.profiles SET steply_score = total_score WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ── Eski skor trigger fonksiyonları ──────────────────────────

CREATE OR REPLACE FUNCTION public.trigger_update_score_follower()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        PERFORM public.calculate_steply_score(NEW.following_id);
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM public.calculate_steply_score(OLD.following_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trigger_update_score_comment()
RETURNS TRIGGER AS $$
DECLARE
    p_owner UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT student_id INTO p_owner FROM public.projects WHERE id = NEW.project_id;
        PERFORM public.calculate_steply_score(p_owner);
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT student_id INTO p_owner FROM public.projects WHERE id = OLD.project_id;
        PERFORM public.calculate_steply_score(p_owner);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trigger_update_score_rating()
RETURNS TRIGGER AS $$
DECLARE
    p_owner UUID;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        SELECT student_id INTO p_owner FROM public.projects WHERE id = NEW.project_id;
        PERFORM public.calculate_steply_score(p_owner);
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT student_id INTO p_owner FROM public.projects WHERE id = OLD.project_id;
        PERFORM public.calculate_steply_score(p_owner);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ── increment_user_activity ───────────────────────────────────
-- Günlük aktivite sayısını atomik olarak 1 artırır (eski wrapper, puan yok).
CREATE OR REPLACE FUNCTION public.increment_user_activity(p_user_id UUID, p_date DATE)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.user_activities (user_id, date, activity_count)
    VALUES (p_user_id, p_date, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET activity_count = user_activities.activity_count + 1;
END;
$$;

-- ── record_user_action ────────────────────────────────────────
-- Yeni ağırlıklı puan sistemi:
--   create_project=10, complete_project=20, complete_task=5,
--   add_comment=2, add_log=2, diğer=1
-- user_activities (daily_score + activity_count) + profiles.total_score atomik günceller.
CREATE OR REPLACE FUNCTION public.record_user_action(p_user_id UUID, p_action_type TEXT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_points INTEGER;
    v_today  DATE := CURRENT_DATE;
BEGIN
    v_points := CASE p_action_type
        WHEN 'create_project'   THEN 10
        WHEN 'complete_project' THEN 20
        WHEN 'complete_task'    THEN 5
        WHEN 'add_comment'      THEN 2
        WHEN 'add_log'          THEN 2
        ELSE                         1
    END;

    INSERT INTO public.user_activities (user_id, date, activity_count, daily_score)
    VALUES (p_user_id, v_today, 1, v_points)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        activity_count = user_activities.activity_count + 1,
        daily_score    = user_activities.daily_score    + v_points;

    UPDATE public.profiles
    SET total_score = COALESCE(total_score, 0) + v_points
    WHERE id = p_user_id;
END;
$$;

-- ── search_users ──────────────────────────────────────────────
-- full_name veya email ile ILIKE araması. institution alanını da döner.
CREATE OR REPLACE FUNCTION public.search_users(search_query TEXT)
RETURNS TABLE (
    id          UUID,
    full_name   TEXT,
    email       TEXT,
    role        TEXT,
    steply_score INTEGER,
    institution TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.role, p.steply_score, p.institution
    FROM public.profiles p
    WHERE p.full_name ILIKE '%' || search_query || '%'
       OR p.email     ILIKE '%' || search_query || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── search_profiles_unaccent ──────────────────────────────────
-- Türkçe karakter destekli (unaccent) profil araması. İlk 10 sonuç döner.
CREATE OR REPLACE FUNCTION public.search_profiles_unaccent(search_query text)
RETURNS TABLE(id uuid, full_name text, avatar_url text, is_public boolean, role text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
    SELECT id, full_name, avatar_url, is_public, role
    FROM public.profiles
    WHERE unaccent(lower(full_name)) LIKE unaccent(lower('%' || search_query || '%'))
    LIMIT 10;
$$;

-- ── search_universities ───────────────────────────────────────
-- Türkçe karakter + pg_trgm destekli üniversite araması.
-- Başa göre eşleşenler önce sıralanır (CASE sıralama).
CREATE OR REPLACE FUNCTION public.search_universities(q text, lim int DEFAULT 12)
RETURNS TABLE(name text, country text)
LANGUAGE sql STABLE AS $$
    SELECT name, country
    FROM public.universities
    WHERE lower(unaccent(name)) LIKE '%' || lower(unaccent(q)) || '%'
    ORDER BY
        CASE WHEN lower(unaccent(name)) LIKE lower(unaccent(q)) || '%' THEN 0 ELSE 1 END,
        name
    LIMIT lim;
$$;

-- ── get_user_id_by_email ──────────────────────────────────────
-- auth.users tablosundan email ile UUID döner (linked_accounts için kullanılır).
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
    SELECT id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
$$;


-- =============================================================
-- BÖLÜM 9: TRIGGER'LAR
-- =============================================================

-- Auth trigger: yeni kullanıcı kaydında profiles satırı oluşturur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Eski skor sistemi trigger'ları (followers tablosuna bağlı)
DROP TRIGGER IF EXISTS update_score_on_follower ON public.followers;
CREATE TRIGGER update_score_on_follower
    AFTER INSERT OR DELETE ON public.followers
    FOR EACH ROW EXECUTE FUNCTION public.trigger_update_score_follower();

DROP TRIGGER IF EXISTS update_score_on_comment ON public.comments;
CREATE TRIGGER update_score_on_comment
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.trigger_update_score_comment();

DROP TRIGGER IF EXISTS update_score_on_rating ON public.ratings;
CREATE TRIGGER update_score_on_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.trigger_update_score_rating();


-- =============================================================
-- BÖLÜM 10: ROW LEVEL SECURITY (RLS)
-- =============================================================

-- ── RLS Aktifleştirme ─────────────────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_types     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentored_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_accounts   ENABLE ROW LEVEL SECURITY;


-- ── PROFILES politikaları ─────────────────────────────────────
-- Tüm authenticate kullanıcılar herkesi okuyabilir (sosyal platform).
-- Yazma sadece kendi satırına.
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
    ON public.profiles FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
    ON public.profiles FOR DELETE TO authenticated
    USING (auth.uid() = id);


-- ── PROJECTS politikaları ─────────────────────────────────────
-- SELECT: sahip, ekip üyesi veya projenin is_private = false olması yeterli.
-- UPDATE: sahip veya ekip üyesi yapabilir.
-- INSERT/DELETE: yalnızca sahip.
DROP POLICY IF EXISTS "projects_select_private_aware" ON public.projects;
CREATE POLICY "projects_select_private_aware"
    ON public.projects FOR SELECT TO authenticated
    USING (
        auth.uid() = student_id
        OR NOT is_private
        OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = public.projects.id
              AND pm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
CREATE POLICY "projects_insert_own"
    ON public.projects FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "projects_update_own_or_member" ON public.projects;
CREATE POLICY "projects_update_own_or_member"
    ON public.projects FOR UPDATE TO authenticated
    USING (
        auth.uid() = student_id
        OR EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_id = public.projects.id AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = student_id
        OR EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_id = public.projects.id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;
CREATE POLICY "projects_delete_own"
    ON public.projects FOR DELETE TO authenticated
    USING (auth.uid() = student_id);


-- ── MESSAGES politikaları ─────────────────────────────────────
-- Sadece gönderen veya alıcı okuyabilir; gönderen yazabilir/silebilir.
DROP POLICY IF EXISTS "messages_select_participants" ON public.messages;
CREATE POLICY "messages_select_participants"
    ON public.messages FOR SELECT TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_insert_own"
    ON public.messages FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
CREATE POLICY "messages_delete_own"
    ON public.messages FOR DELETE TO authenticated
    USING (auth.uid() = sender_id);


-- ── FOLLOWS politikaları ──────────────────────────────────────
-- Takip ilişkileri herkese açık; kendi takip satırını oluşturur/siler.
DROP POLICY IF EXISTS "follows_select_all" ON public.follows;
CREATE POLICY "follows_select_all"
    ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "follows_insert_own" ON public.follows;
CREATE POLICY "follows_insert_own"
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;
CREATE POLICY "follows_delete_own"
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);


-- ── FOLLOWERS politikaları (eski tablo) ───────────────────────
DROP POLICY IF EXISTS "followers_select_authenticated" ON public.followers;
CREATE POLICY "followers_select_authenticated"
    ON public.followers FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "followers_insert_own" ON public.followers;
CREATE POLICY "followers_insert_own"
    ON public.followers FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "followers_delete_own" ON public.followers;
CREATE POLICY "followers_delete_own"
    ON public.followers FOR DELETE TO authenticated
    USING (auth.uid() = follower_id);


-- ── COMMENTS politikaları ─────────────────────────────────────
DROP POLICY IF EXISTS "comments_select_authenticated" ON public.comments;
CREATE POLICY "comments_select_authenticated"
    ON public.comments FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
CREATE POLICY "comments_insert_own"
    ON public.comments FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own"
    ON public.comments FOR UPDATE TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own"
    ON public.comments FOR DELETE TO authenticated
    USING (auth.uid() = user_id);


-- ── RATINGS politikaları ──────────────────────────────────────
DROP POLICY IF EXISTS "ratings_select_authenticated" ON public.ratings;
CREATE POLICY "ratings_select_authenticated"
    ON public.ratings FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "ratings_insert_own" ON public.ratings;
CREATE POLICY "ratings_insert_own"
    ON public.ratings FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ratings_update_own" ON public.ratings;
CREATE POLICY "ratings_update_own"
    ON public.ratings FOR UPDATE TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ratings_delete_own" ON public.ratings;
CREATE POLICY "ratings_delete_own"
    ON public.ratings FOR DELETE TO authenticated
    USING (auth.uid() = user_id);


-- ── PROJECT_MEMBERS politikaları ──────────────────────────────
-- Tüm üyelikler okunabilir; yalnızca proje sahibi ekler/siler.
DROP POLICY IF EXISTS "project_members_select_authenticated" ON public.project_members;
CREATE POLICY "project_members_select_authenticated"
    ON public.project_members FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "project_members_insert_owner" ON public.project_members;
CREATE POLICY "project_members_insert_owner"
    ON public.project_members FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND student_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "project_members_delete_owner" ON public.project_members;
CREATE POLICY "project_members_delete_owner"
    ON public.project_members FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND student_id = auth.uid()
        )
    );


-- ── PROJECT_TASKS politikaları ────────────────────────────────
-- Yalnızca proje sahibi veya ekip üyesi okuyabilir.
-- Yazma yalnızca service-role admin client üzerinden (RPC/server action).
DROP POLICY IF EXISTS "Project team can view tasks" ON public.project_tasks;
CREATE POLICY "Project team can view tasks"
    ON public.project_tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_tasks.project_id
              AND projects.student_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = project_tasks.project_id
              AND project_members.user_id = auth.uid()
        )
    );


-- ── PROJECT_ACTIVITIES politikaları ──────────────────────────
-- Yalnızca proje sahibi veya ekip üyesi okuyabilir.
-- INSERT service-role admin client ile yapılır.
DROP POLICY IF EXISTS "Project team can view activities" ON public.project_activities;
CREATE POLICY "Project team can view activities"
    ON public.project_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_activities.project_id
              AND projects.student_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = project_activities.project_id
              AND project_members.user_id = auth.uid()
        )
    );


-- ── PROJECT_DISCUSSIONS politikaları ─────────────────────────
-- Okuma ve yazma: proje sahibi veya ekip üyesi; INSERT'te user_id = auth.uid() zorunlu.
DROP POLICY IF EXISTS "Project team can read discussions" ON public.project_discussions;
CREATE POLICY "Project team can read discussions"
    ON public.project_discussions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_discussions.project_id
              AND projects.student_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.project_members
            WHERE project_members.project_id = project_discussions.project_id
              AND project_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Project team can insert discussions" ON public.project_discussions;
CREATE POLICY "Project team can insert discussions"
    ON public.project_discussions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            EXISTS (
                SELECT 1 FROM public.projects
                WHERE projects.id = project_discussions.project_id
                  AND projects.student_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_members.project_id = project_discussions.project_id
                  AND project_members.user_id = auth.uid()
            )
        )
    );


-- ── PROJECT_TYPES politikaları ────────────────────────────────
-- Sadece okunabilir; yazma service-role ile.
DROP POLICY IF EXISTS "project_types_read_auth" ON public.project_types;
CREATE POLICY "project_types_read_auth"
    ON public.project_types FOR SELECT
    USING (auth.role() = 'authenticated');


-- ── USER_ACTIVITIES politikaları ─────────────────────────────
-- Tüm authenticate kullanıcılar okuyabilir (leaderboard + heatmap için).
-- Yazma service-role admin client ile.
DROP POLICY IF EXISTS "Anyone authenticated can read activities" ON public.user_activities;
CREATE POLICY "Anyone authenticated can read activities"
    ON public.user_activities FOR SELECT
    USING (auth.role() = 'authenticated');


-- ── AGENDA_TASKS politikaları ─────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own agenda tasks" ON public.agenda_tasks;
CREATE POLICY "Users can view their own agenda tasks"
    ON public.agenda_tasks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own agenda tasks" ON public.agenda_tasks;
CREATE POLICY "Users can insert their own agenda tasks"
    ON public.agenda_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own agenda tasks" ON public.agenda_tasks;
CREATE POLICY "Users can update their own agenda tasks"
    ON public.agenda_tasks FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own agenda tasks" ON public.agenda_tasks;
CREATE POLICY "Users can delete their own agenda tasks"
    ON public.agenda_tasks FOR DELETE
    USING (auth.uid() = user_id);


-- ── NOTIFICATIONS politikaları ────────────────────────────────
-- Sadece kendi bildirimlerini okur/günceller; INSERT service-role ile.
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);


-- ── LINKED_ACCOUNTS politikaları ─────────────────────────────
-- Tüm işlemler yalnızca owner'a ait (ALL policy).
DROP POLICY IF EXISTS "owners can manage own linked accounts" ON public.linked_accounts;
CREATE POLICY "owners can manage own linked accounts"
    ON public.linked_accounts FOR ALL
    USING (owner_user_id = auth.uid());


-- ── MENTORED_PROJECTS ve PROJECT_NOTES ────────────────────────
-- Bu tablolar için RLS migration'larda yorum satırı olarak bırakılmış
-- (uygulamada business logic ile kontrol edilir). Temel politikalar:
ALTER TABLE public.mentored_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers can manage their mentored projects" ON public.mentored_projects;
CREATE POLICY "Teachers can manage their mentored projects"
    ON public.mentored_projects FOR ALL
    USING (auth.uid() = teacher_id);

ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers can manage their project notes" ON public.project_notes;
CREATE POLICY "Teachers can manage their project notes"
    ON public.project_notes FOR ALL
    USING (auth.uid() = teacher_id);


-- =============================================================
-- BÖLÜM 11: STORAGE POLİTİKALARI (project-files bucket)
-- =============================================================

DROP POLICY IF EXISTS "storage_project_files_select" ON storage.objects;
CREATE POLICY "storage_project_files_select"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'project-files');

DROP POLICY IF EXISTS "storage_project_files_insert" ON storage.objects;
CREATE POLICY "storage_project_files_insert"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'project-files');

DROP POLICY IF EXISTS "storage_project_files_update" ON storage.objects;
CREATE POLICY "storage_project_files_update"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'project-files');

DROP POLICY IF EXISTS "storage_project_files_delete" ON storage.objects;
CREATE POLICY "storage_project_files_delete"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'project-files');


-- =============================================================
-- BÖLÜM 12: İNDEKSLER (Performans)
-- =============================================================

-- Arama indeksleri (pg_trgm GIN)
CREATE INDEX IF NOT EXISTS trgm_idx_profiles_full_name
    ON public.profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS trgm_idx_profiles_email
    ON public.profiles USING gin (email gin_trgm_ops);

-- follows
CREATE INDEX IF NOT EXISTS follows_follower_idx   ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS follows_following_idx  ON public.follows (following_id);

-- blocks
CREATE INDEX IF NOT EXISTS blocks_blocker_idx ON public.blocks (blocker_id);
CREATE INDEX IF NOT EXISTS blocks_blocked_idx ON public.blocks (blocked_id);

-- project_favorites
CREATE INDEX IF NOT EXISTS proj_fav_user_idx    ON public.project_favorites (user_id);
CREATE INDEX IF NOT EXISTS proj_fav_project_idx ON public.project_favorites (project_id);

-- project_tasks
CREATE INDEX IF NOT EXISTS project_tasks_project_id_idx
    ON public.project_tasks (project_id);

-- project_activities
CREATE INDEX IF NOT EXISTS project_activities_project_id_idx
    ON public.project_activities (project_id);
CREATE INDEX IF NOT EXISTS project_activities_project_created_idx
    ON public.project_activities (project_id, created_at DESC);

-- project_discussions
CREATE INDEX IF NOT EXISTS project_discussions_project_id_idx
    ON public.project_discussions (project_id);
CREATE INDEX IF NOT EXISTS project_discussions_project_created_idx
    ON public.project_discussions (project_id, created_at ASC);

-- notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_idx
    ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx
    ON public.notifications (user_id, is_read);

-- project_types
CREATE INDEX IF NOT EXISTS project_types_usage_idx
    ON public.project_types (usage_count DESC);


-- =============================================================
-- BÖLÜM 13: PROJECT_TYPES SEED VERİSİ
-- =============================================================
INSERT INTO public.project_types (name, usage_count) VALUES
    ('Web App',             8),
    ('Mobile App',          7),
    ('REST API',            6),
    ('Machine Learning',    5),
    ('Desktop App',         4),
    ('Data Analysis',       4),
    ('Game',                3),
    ('CLI Tool',            3),
    ('Browser Extension',   2),
    ('Blockchain',          2),
    ('IoT',                 2),
    ('DevOps / CI-CD',      1),
    ('Chrome Extension',    1),
    ('Bot / Automation',    1)
ON CONFLICT (name) DO NOTHING;


-- =============================================================
-- SON NOT:
-- universities tablosunun seed verisi (10 214 satır, ~530 KB) bu
-- scripte dahil edilmemiştir. Şu dosyayı ayrıca çalıştırın:
--   supabase/migrations/20260518_universities.sql
--   supabase/migrations/20260518_add_ksbu.sql
-- =============================================================

NOTIFY pgrst, 'reload schema';
