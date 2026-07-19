-- 1. Add photo columns to hrms_attendance table
ALTER TABLE public.hrms_attendance ADD COLUMN IF NOT EXISTS check_in_photo_url text;
ALTER TABLE public.hrms_attendance ADD COLUMN IF NOT EXISTS check_out_photo_url text;

-- 2. Create the storage bucket for selfies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attendance_selfies', 'attendance_selfies', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies for the new bucket
-- Allow public read access to selfies
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'attendance_selfies');

-- Allow authenticated users to upload selfies
CREATE POLICY "Auth Uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'attendance_selfies');

-- Allow authenticated users to update their selfies
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'attendance_selfies');
