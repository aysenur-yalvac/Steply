-- Create Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Assignment Submissions Table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
-- Anyone authenticated can view assignments
CREATE POLICY "Enable read access for authenticated users on assignments" ON public.assignments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only teachers can create assignments (assuming teacher_id matches their own auth.uid)
CREATE POLICY "Enable insert for users based on teacher_id" ON public.assignments
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Enable update for users based on teacher_id" ON public.assignments
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Enable delete for users based on teacher_id" ON public.assignments
    FOR DELETE USING (auth.uid() = teacher_id);

-- RLS Policies for assignment_submissions
-- Teachers can view all submissions for their assignments. Students can view their own submissions.
CREATE POLICY "Enable read access for submissions" ON public.assignment_submissions
    FOR SELECT USING (
        auth.uid() = student_id OR
        EXISTS (
            SELECT 1 FROM public.assignments a 
            WHERE a.id = assignment_submissions.assignment_id AND a.teacher_id = auth.uid()
        )
    );

-- Students can insert their own submissions
CREATE POLICY "Enable insert for student submissions" ON public.assignment_submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Storage bucket for assignments
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Give users authenticated access to assignments folder 1ogk2_0" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'assignments');
CREATE POLICY "Give users authenticated access to assignments folder 1ogk2_1" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assignments');
CREATE POLICY "Give users authenticated access to assignments folder 1ogk2_2" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assignments');
CREATE POLICY "Give users authenticated access to assignments folder 1ogk2_3" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assignments');
