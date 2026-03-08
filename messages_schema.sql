-- Ensure the messages table has the correct structure
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for messages if not already
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Re-apply policies (Just in case)
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own sent messages" ON public.messages;

CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ( auth.uid() = sender_id );
CREATE POLICY "Users can delete own sent messages" ON public.messages FOR DELETE USING ( auth.uid() = sender_id );
