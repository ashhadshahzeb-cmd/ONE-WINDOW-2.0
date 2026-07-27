-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    user_role TEXT, -- if null, broadcast to everyone. if set, broadcast to specific role.
    link TEXT, -- optional link to navigate when clicked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and update their own notifications
CREATE POLICY "Allow authenticated read notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update notifications" ON public.notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete notifications" ON public.notifications FOR DELETE TO authenticated USING (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
