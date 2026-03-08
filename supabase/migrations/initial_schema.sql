-- Steply: Social EdTech Platform - Initial Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT CHECK (role IN ('student', 'teacher')),
    steply_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    progress_percentage INTEGER DEFAULT 0,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    files JSONB DEFAULT '[]',
    team_members JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Social Tables
-- Followers
CREATE TABLE IF NOT EXISTS followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, user_id)
);

-- 5. Steply Puanı Hesaplama Fonksiyonu
CREATE OR REPLACE FUNCTION calculate_steply_score(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    f_count INTEGER;
    avg_rating FLOAT;
    c_count INTEGER;
    total_score INTEGER;
BEGIN
    SELECT count(*) INTO f_count FROM followers WHERE following_id = user_uuid;
    
    SELECT COALESCE(avg(r.score), 0) INTO avg_rating 
    FROM ratings r 
    JOIN projects p ON r.project_id = p.id 
    WHERE p.student_id = user_uuid;
    
    SELECT count(*) INTO c_count 
    FROM comments c 
    JOIN projects p ON c.project_id = p.id 
    WHERE p.student_id = user_uuid;
    
    -- Puan Formülü: (Takipçi * 10) + (Avg Rating * 20) + (Yorum * 5)
    total_score := (f_count * 10) + (avg_rating * 20) + (c_count * 5);
    
    UPDATE profiles SET steply_score = total_score WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 6. Tetikleyiciler (Triggers)
CREATE OR REPLACE FUNCTION trigger_update_score_follower()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        PERFORM calculate_steply_score(NEW.following_id);
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM calculate_steply_score(OLD.following_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_score_on_follower
AFTER INSERT OR DELETE ON followers
FOR EACH ROW EXECUTE FUNCTION trigger_update_score_follower();

CREATE OR REPLACE FUNCTION trigger_update_score_comment()
RETURNS TRIGGER AS $$
DECLARE
    p_owner UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT student_id INTO p_owner FROM projects WHERE id = NEW.project_id;
        PERFORM calculate_steply_score(p_owner);
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT student_id INTO p_owner FROM projects WHERE id = OLD.project_id;
        PERFORM calculate_steply_score(p_owner);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_score_on_comment
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION trigger_update_score_comment();

CREATE OR REPLACE FUNCTION trigger_update_score_rating()
RETURNS TRIGGER AS $$
DECLARE
    p_owner UUID;
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        SELECT student_id INTO p_owner FROM projects WHERE id = NEW.project_id;
        PERFORM calculate_steply_score(p_owner);
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT student_id INTO p_owner FROM projects WHERE id = OLD.project_id;
        PERFORM calculate_steply_score(p_owner);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_score_on_rating
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW EXECUTE FUNCTION trigger_update_score_rating();
