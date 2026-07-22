-- Run this in your Supabase SQL Editor to create the pending files table

CREATE TABLE IF NOT EXISTS public.file_tracking_pending (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_code TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    file_image TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.file_tracking_pending ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access (for internal apps, matching the rest of the schema)
CREATE POLICY "Allow authenticated read file_tracking_pending" 
ON public.file_tracking_pending FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert file_tracking_pending" 
ON public.file_tracking_pending FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update file_tracking_pending" 
ON public.file_tracking_pending FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete file_tracking_pending" 
ON public.file_tracking_pending FOR DELETE TO authenticated USING (true);
