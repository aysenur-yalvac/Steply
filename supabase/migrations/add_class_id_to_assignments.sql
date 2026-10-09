-- assignments tablosuna class_id ekleme
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE;

-- Indeks ekleyerek sorgu performansını artırma
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.assignments(class_id);
