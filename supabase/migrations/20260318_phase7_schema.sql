-- Phase 7 Schema Updates

-- 1. Extend profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 2. Create agenda_tasks table
CREATE TABLE IF NOT EXISTS agenda_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for agenda_tasks
ALTER TABLE agenda_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for agenda_tasks
CREATE POLICY "Users can view their own agenda tasks" 
ON agenda_tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agenda tasks" 
ON agenda_tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agenda tasks" 
ON agenda_tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agenda tasks" 
ON agenda_tasks FOR DELETE 
USING (auth.uid() = user_id);
